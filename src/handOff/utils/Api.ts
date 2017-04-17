import { Db, Collection, UpdateWriteOpResult } from 'mongodb'

export class Api {

    collection: Collection;

    constructor(private db: Db) {
        this.collection = db.collection('users')
    }

    getHandOffStatus(connieId: string): Promise<boolean> {
        let status = this.collection.find({ connieId: connieId }, { handOff: 1, _id: 0 }).toArray()
            .then((response: any[]) => {
                return response && response[0].handOff ? true : false;
            });

        return status;
    }

    updateHandOffStatus(connieId: string, updateValue: boolean): Promise<UpdateWriteOpResult> {
        return this.collection.updateOne({ connieId: connieId }, { $set: { handOff: updateValue } });
    }
}
