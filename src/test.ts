import CreateDataSet from "./email/CreateDataSet.js";
import DecisionTree from "./email/DecisionTree.js";

const cd = CreateDataSet.get();

const tree = new DecisionTree();
tree.training({
    trainingSet: cd.getModel(),
    categoryAttr: "verification",
    ignoredAttributes: ["email", "port"],
    entropyThrehold: 0.01,
    maxTreeDepth: 1000,
});

const search = "jallen@smithfence.com";


cd.lookUpSingleEmail(search).then((data) => {
    cd.judge(data, tree);
});

