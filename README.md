# Usage

	$ mvn -e exec:java -Dexec.mainClass="org.neo4j.analysis.CompareTwoStores" -Dexec.args="<directory1> <directory2>"

Or just use your IDE, probably a lot easier.

Then look in `target/report`.