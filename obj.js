class Prosion {
    constructor(){
        this.name = 'zhao',
        this.age = '32'
    }
    say(){
        console.log('heiheihei');
    }
}
class Son extends Prosion{
    constructor(name){
        super()
        this.name = name,
        this.age = '20'
    }
}
const a = new Son('wang')
let arr = [[0],[1],[2]]
let ary = arr[0]
arr[0][0] = 9
console.log(ary);