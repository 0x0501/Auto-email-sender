export default interface BuildDecisionTreeOptions {
    trainingSet              : any,
    minItemsCount            ?: number,
    categoryAttr             : string,
    entropyThrehold          ?: number,
    maxTreeDepth             ?: number,
    ignoredAttributes        : Array<String>
}