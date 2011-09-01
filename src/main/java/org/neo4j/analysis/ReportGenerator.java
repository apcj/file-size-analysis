package org.neo4j.analysis;

import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;
import org.apache.commons.io.filefilter.TrueFileFilter;
import org.apache.commons.lang3.StringUtils;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

public class ReportGenerator {
    public static void main(String[] args) throws Exception {
        new ReportGenerator().generate(args[0]);
    }

    private void generate(String root) throws IOException {
        File reportDirectory = new File("target/report");
        reportDirectory.mkdirs();

        new FileLister().list(root, reportDirectory);
        new ReductionPotentialAnalyser().analyse(root, reportDirectory);
        copyStaticFiles(reportDirectory);
    }

    private void copyStaticFiles(File reportDirectory) throws IOException {
        FileUtils.copyDirectory(new File("src/main/static"), reportDirectory);
    }
}
