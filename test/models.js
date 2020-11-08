class Game {

    id
    dateTime
    userid
    amount
    type

    constructor(id,dateTime,userid,amount,type){
        this.id=id
        this.userid=userid
        this.amount=amount
        this.type=type
        this.dateTime=dateTime
    }
    
}



module.exports = {
    Game
};
