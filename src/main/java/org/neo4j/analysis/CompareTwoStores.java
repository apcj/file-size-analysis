package org.neo4j.analysis;

import org.apache.commons.io.FileUtils;

import java.io.File;
import java.io.IOException;

public class CompareTwoStores {
    public static void main(String[] args) throws Exception {
        new CompareTwoStores().generate(args[0], args[1]);
    }

    private void generate(String originalStore, String reducedStore) throws IOException {
        File reportDirectory = new File("target/report");
        reportDirectory.mkdirs();

        new FileLister().list(originalStore).writeTo("originalStore", new File(reportDirectory, "originalStore.js"));
        new FileLister().list(reducedStore).writeTo("reducedStore", new File(reportDirectory, "reducedStore.js"));
        copyStaticFiles(reportDirectory);
    }

    private void copyStaticFiles(File reportDirectory) throws IOException {
        FileUtils.copyDirectory(new File("src/main/static"), reportDirectory);
    }
}
