class Game {

    id
    timeStamp
    userid
    amount
    type

    constructor(id,timeStamp,userid,amount,type){
        this.id=id
        this.userid=userid
        this.amount=amount
        this.type=type
        this.timeStamp=timeStamp
    }
    
}



module.exports = {
    Game
};
