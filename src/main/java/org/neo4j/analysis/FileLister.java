package org.neo4j.analysis;

import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;
import org.apache.commons.io.filefilter.TrueFileFilter;
import org.apache.commons.lang3.StringUtils;

import java.io.*;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

public class FileLister {

    public void list(String root, File reportDirectory) throws IOException {
        File rootFolder = new File(root);
        @SuppressWarnings({"unchecked"})
        Collection<File> files = FileUtils.listFiles(rootFolder, TrueFileFilter.INSTANCE, TrueFileFilter.INSTANCE);

        List<String> elements = new ArrayList<String>();

        for (File file : files) {
            elements.add(String.format("{ folder: \"%s\", name: \"%s\", size: %d }",
                    folder(rootFolder, file), file.getName(), file.length()));
        }

        PrintWriter writer = new PrintWriter(new FileOutputStream(new File(reportDirectory, "listing.js")));
        writer.println("root = \"" + rootFolder.getName() + "\";");
        writer.println("listing = [\n" + StringUtils.join(elements, ",\n") + "\n];");
        writer.close();
    }

    private String folder(File locationDir, File file) {
        return file.getParentFile().getAbsolutePath().substring(locationDir.getAbsolutePath().length());
    }

}
