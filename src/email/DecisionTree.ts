import BuildDecisionTreeOptions from "./interface/BuildDecisionTreeOptions.js";

class DecisionTree {
    private _predicates: any;

    private _root: any;

    constructor(config?: BuildDecisionTreeOptions) {
        this._predicates = {
            "==": (a: any, b: any) => {
                return a == b;
            },
            ">=": (a: number, b: number) => {
                return a >= b;
            },
        };
    }

    countUniqueValues(items: any, attr: string) {
        let counter: any = {};
        for (let i of items) {
            if (!counter[i[attr]]) counter[i[attr]] = 0;
            counter[i[attr]] += 1;
        }
        return counter;
    }

    getMaxKey(counter: any) {
        let mostFrequentValue;
        for (let k in counter) {
            if (!mostFrequentValue) mostFrequentValue = k;
            if (counter[k] > counter[mostFrequentValue]) {
                mostFrequentValue = k;
            }
        }
        return mostFrequentValue;
    }

    mostFrequentValue(items: any, attr: string) {
        return this.getMaxKey(this.countUniqueValues(items, attr));
    }

    split(items: any, attr: string, predicate: any, pivot: any) {
        let match: Array<any> = [];
        let notMatch: Array<any> = [];

        for (let item of items) {
            if (predicate(item[attr], pivot)) {
                match.push(item);
            } else {
                notMatch.push(item);
            }
        }
        return {
            match: match,
            notMatch: notMatch,
        };
    }

    entropy(items: any, attr: string) {
        let counter = this.countUniqueValues(items, attr);
        let p,
            entropy = 0; //H(S)=entropy=∑(P(Xi)(log2(P(Xi))))
        for (let i in counter) {
            //entropy+=-(P(Xi)(log2(P(Xi))))
            p = counter[i] / items.length; //P(Xi) possible value
            entropy += -p * Math.log2(p);
        }
        return entropy;
    }

    buildDecisionTree(config: any) {
        let trainingSet = config.trainingSet;
        let minItemsCount = config.minItemsCount;
        let categoryAttr = config.categoryAttr;
        let entropyThrehold = config.entropyThrehold;
        let maxTreeDepth = config.maxTreeDepth;
        let ignoredAttributes = config.ignoredAttributes;

        if (maxTreeDepth == 0 || trainingSet.length <= minItemsCount) {
            return {
                category: this.mostFrequentValue(trainingSet, categoryAttr),
            };
        }

        let initialEntropy = this.entropy(trainingSet, categoryAttr); //<===H(S)

        if (initialEntropy <= entropyThrehold) {
            return {
                category: this.mostFrequentValue(trainingSet, categoryAttr),
            };
        }
        let alreadyChecked = [];
        let bestSplit: any = { gain: 0 };

        for (let item of trainingSet) {
            for (let attr in item) {
                if (
                    attr == categoryAttr ||
                    ignoredAttributes.indexOf(attr) >= 0
                )
                    continue;
                let pivot = item[attr];
                let predicateName = typeof pivot == "number" ? ">=" : "==";
                let attrPredPivot = attr + predicateName + pivot;
                if (alreadyChecked.indexOf(attrPredPivot) >= 0) continue;
                alreadyChecked.push(attrPredPivot);
                let predicate = this._predicates[predicateName];
                let currSplit = this.split(trainingSet, attr, predicate, pivot);
                let matchEntropy = this.entropy(currSplit.match, categoryAttr);
                let notMatchEntropy = this.entropy(
                    currSplit.notMatch,
                    categoryAttr
                );

                // IG(A,S)=H(S)-(∑P(t)H(t)))
                let iGain =
                    initialEntropy -
                    (matchEntropy * currSplit.match.length +
                        notMatchEntropy * currSplit.notMatch.length) /
                        trainingSet.length;

                if (iGain > bestSplit.gain) {
                    bestSplit = currSplit;
                    bestSplit.predicateName = predicateName;
                    bestSplit.predicate = predicate;
                    bestSplit.attribute = attr;
                    bestSplit.pivot = pivot;
                    bestSplit.gain = iGain;
                }
            }
        }

        if (!bestSplit.gain) {
            return {
                category: this.mostFrequentValue(trainingSet, categoryAttr),
            };
        }

        config.maxTreeDepth = maxTreeDepth - 1;
        config.trainingSet = bestSplit.match;
        let matchSubTree: any = this.buildDecisionTree(config);
        config.trainingSet = bestSplit.notMatch;
        let notMatchSubTree: any = this.buildDecisionTree(config);
        return {
            attribute: bestSplit.attribute,
            predicate: bestSplit.predicate,
            predicateName: bestSplit.predicateName,
            pivot: bestSplit.pivot,
            match: matchSubTree,
            notMatch: notMatchSubTree,
            matchedCount: bestSplit.match.length,
            notMatchedCount: bestSplit.notMatch.length,
        };
    }

    training(config: BuildDecisionTreeOptions) {
        this._root = this.buildDecisionTree({
            trainingSet: config.trainingSet, //Train Set
            ignoredAttributes: config.ignoredAttributes || [],
            categoryAttr: config.categoryAttr || "category",
            minItemsCount: config.minItemsCount || 10,
            entropyThrehold: config.entropyThrehold || 0.01,
            maxTreeDepth: config.maxTreeDepth || 1000000,
        });
    }

    predict(data: any) {
        let attr, value, predicate, pivot;
        let tree = this._root;
        while (true) {
            if (tree.category) {
                return tree.category;
            }
            attr = tree.attribute;
            value = data[attr];
            predicate = tree.predicate;
            pivot = tree.pivot;
            if (predicate(value, pivot)) {
                tree = tree.match;
            } else {
                tree = tree.notMatch;
            }
        }
    }
}

export default DecisionTree;
