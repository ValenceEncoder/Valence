export default class M2AError implements Error {
    public readonly name:string = "M2AError";
    public stack:string;

    constructor(public message:string) {

    }
}