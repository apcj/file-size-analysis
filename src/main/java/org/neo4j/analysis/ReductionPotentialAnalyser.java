package org.neo4j.analysis;

import org.apache.commons.io.IOUtils;
import org.apache.commons.lang3.StringUtils;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public class ReductionPotentialAnalyser {

    public void analyse(String root, File reportDirectory) throws IOException {

        List<String> elements = new ArrayList<String>();
        elements.add(new Reduction("neostore.propertystore.db.arrays", 0.98).toJson());
        elements.add(new Reduction("neostore.propertystore.db.strings", 0.60).toJson());

        FileWriter writer = new FileWriter(new File(reportDirectory, "analysis.js"));
        IOUtils.write("analysis = [\n" + StringUtils.join(elements, ",\n") + "\n];", writer);
        writer.close();
    }

    static class Reduction {
        String name;
        double reductionRatio;

        Reduction(String name, double reductionRatio) {
            this.name = name;
            this.reductionRatio = reductionRatio;
        }

        String toJson() {
            return String.format("{ name: \"%s\", reductionRatio: %f }", name, reductionRatio);
        }
    }
}
