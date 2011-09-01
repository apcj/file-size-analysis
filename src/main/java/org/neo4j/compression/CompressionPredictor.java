package org.neo4j.compression;

import org.apache.commons.lang3.StringUtils;

import java.io.*;
import java.util.ArrayList;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

public class CompressionPredictor {

    public static void main(String[] args) throws IOException {
        new CompressionPredictor().analyse(new File(args[0]));
    }

    private void analyse(File rootFolder) throws IOException {
        CompressionAnalysis compressionAnalysis = new CompressionAnalysis();
        for (File file : rootFolder.listFiles(new NotDirectories())) {
            compressionAnalysis.add(analyseFile(file));
        }

        File reportDirectory = new File("target/report");
        //noinspection ResultOfMethodCallIgnored
        reportDirectory.mkdirs();
        File outputFile = new File(reportDirectory, "compression_ratios.js");
        PrintWriter printWriter = new PrintWriter(new FileOutputStream(outputFile));

        printWriter.println("compressionAnalysis = " + compressionAnalysis.toJson() + ";");

        printWriter.close();
    }

    private static class CompressionAnalysis {

        private List<FileCompressionStatistics> list = new ArrayList<FileCompressionStatistics>();

        public void add(FileCompressionStatistics fileCompressionStatistics) {
            list.add(fileCompressionStatistics);
        }

        public String toJson() {
            List<String> elements = new ArrayList<String>();
            for (FileCompressionStatistics statistics : list) {
                elements.add(statistics.toJson());
            }
            return "[\n" + StringUtils.join(elements, ",\n") + "];";
        }
    }

    private class FileCompressionStatistics {
        String fileName;
        List<MinAverageMax> statistics;

        private FileCompressionStatistics(String fileName, List<MinAverageMax> statistics) {
            this.fileName = fileName;
            this.statistics = statistics;
        }

        public String toJson() {
            List<String> elements = new ArrayList<String>();
            for (MinAverageMax minAverageMax : statistics) {
                elements.add(minAverageMax.toJson());
            }
            return "{ fileName: \"" + fileName + "\", statistics: [\n" + StringUtils.join(elements, ",\n") + "] }";
        }
    }

    private FileCompressionStatistics analyseFile(File file) throws IOException {
        List<MinAverageMax> results = new ArrayList<MinAverageMax>();
        for (int blockSize = 1024; blockSize <= 1024 * 1024; blockSize *= 2) {
            if (file.length() > blockSize) {
                results.add(analyseCompression(file, blockSize));
            }
        }
        return new FileCompressionStatistics(file.getName(), results);
    }

    private MinAverageMax analyseCompression(File file, int blockSize) throws IOException {
        MinAverageMax results = new MinAverageMax(blockSize);

        FileInputStream inputStream = new FileInputStream(file);
        byte[] buffer = new byte[blockSize];
        int bytesRead;
        int bytesInBuffer = 0;
        while (bytesInBuffer < blockSize &&
                (bytesRead = inputStream.read(buffer, bytesInBuffer, blockSize - bytesInBuffer)) != -1) {
            bytesInBuffer += bytesRead;
            if (bytesInBuffer == blockSize) {
                results.record(compressionRatio(buffer));
                bytesInBuffer = 0;
            }
        }
        inputStream.close();
        results.setLeftover(bytesInBuffer);
        return results;
    }

    private static class MinAverageMax {
        int blockSize;
        double min = 1;
        double max = 0;
        double total = 0;
        int blockCount = 0;
        int leftover = 0;

        private MinAverageMax(int blockSize) {
            this.blockSize = blockSize;
        }

        public void record(double ratio) {
            if (ratio < min) {
                min = ratio;
            }
            if (ratio > max) {
                max = ratio;
            }
            total += ratio;
            blockCount++;
        }

        public void setLeftover(int leftover) {
            this.leftover = leftover;
        }

        public String toJson() {
            return String.format("{ blockSize: %d, min: %s, average: %s, max: %s, totalSize: %d }",
                    blockSize, min, total / blockCount, max, blockCount * blockSize + leftover);
        }
    }

    private double compressionRatio(byte[] data) throws IOException {
        ByteCounter byteCounter = new ByteCounter();
        ZipOutputStream outputStream = new ZipOutputStream(byteCounter);
        outputStream.putNextEntry(new ZipEntry("data"));
        outputStream.write(data);
        outputStream.close();
        return (byteCounter.count + 0.0d) / data.length;
    }

    private static class ByteCounter extends OutputStream {
        public int count = 0;

        @Override
        public void write(int b) throws IOException {
            count++;
        }
    }

    private static class NotDirectories implements FileFilter {
        public boolean accept(File file) {
            return !file.isDirectory();
        }
    }
}
