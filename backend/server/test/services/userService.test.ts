import { describe, before, after } from "mocha";
import { should } from "chai";
import { UserService } from "../../src/services/userService";

describe('UserService', () => {
    before(() => {
        console.log('Before hook');
        //database configs??
    })

    describe('registerUser', () => {
        it('should add the user correctly in the database', () => {
            console.log('add?');
            
            // lisääkö
        })

        it('should have correct data', () => {
            console.log('correct?');
            // täsmääkö
        })

        //lisää testejä...

    })

    describe('getUserById', () => {
        it('should return the correct user if in database', () => {
            console.log('palautus');
        })

        it('should handle errors gracefully if not found', () => {
            console.log('ei löydy');
        })

        //lisää testejä...
    })

    //lisää test suiteja...

    after(() => {
        console.log("testien jälkeen tietokannan siivous");
        //jos testietokanta lisätty / tietokantaan lisätty testidataa, siivoa jäljet
    })
})