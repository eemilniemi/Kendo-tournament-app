import { describe, before, after } from "mocha";
import chai from "chai";
import chaiHttp from "chai-http";
import { CreateApp } from "../../src/utility/app.ts";
import * as Helper from "../testHelpers.ts";
import jwt from 'jsonwebtoken';

chai.use(chaiHttp);
const expect = chai.expect;

let app: any;
let authToken: string;

before(async () => {
    // Create test database
    Helper.initializeTestDb();
    app = CreateApp();
    console.log('App created');
    // TODO: Create jwt token for authorization
});

describe('UserService', () => {

    describe('dummy', () => {
        it('should always pass', () => {
            expect(true).to.equal(true);
        });
    });

    describe('RegisterUser', () => {

       const endpoint = '/api/user/register';
        
        it('should require valid password', async () => {
            const res = await chai.request(app).post(endpoint).send(Helper.badPassword);
            expect(res).to.have.status(400);
        });

        it('should return 400 if missing required fields', async () => {
            const res = await chai.request(app).post(endpoint).send();
            expect(res).to.have.status(400);
        });

        it('should add valid user in the database', async () => {
            const res = await chai.request(app).post(endpoint).send(Helper.testUser2);
            expect(res).to.have.status(201);

            const allUsers = await Helper.getTestUsers();
            expect(allUsers).to.have.lengthOf(2);

            const insertedData = await Helper.getTestUserByEmail('test-user2@gmail.com');
            console.log(insertedData);
            expect(insertedData).to.exist;
            expect(insertedData.firstName).to.equal('Other');
        });

        //lisää testejä...

    });

    describe('GetUser', () => {
        // endpoint /api/user/:id
        // get
        it('should return 401 when trying to fetch data unauthorized', async () => {
            const res = await chai
            .request(app).get('/api/user/123');
            expect(res).to.have.status(401);
        });

        it('should return 404 when trying to fetch non-existing data', async () => {
            // UNAUTHORIZED ERROR????
            const res = await chai.request(app).get('/api/user/123');
            expect(res).to.have.status(404);
        });

        it('should return correct existing user', async () => {
            const res = await chai.request(app).get('/api/user/123');
            expect(res).to.have.status(200);
            expect(res.body.firstName).to.equal('Test');
        });

        //lisää testejä...
    });

    describe('EditUser', () => {
        // endpoint /api/user/:id
        // put
        it('should return the correct user if in database', () => {
            expect('TO').to.equal('DO');
        });

        it('should handle errors gracefully if not found', () => {
            expect('TO').to.equal('DO');
        });

        //lisää testejä...
    });

    describe('DeleteUser', () => {
        // endpoint /api/user/:id
        // delete
        it('should return the correct user if in database', () => {
            expect('TO').to.equal('DO');
        });
    });

    //lisää test suiteja...

});

after(async () => {
    // Sulje yhteys testitietokantaan
    await Helper.closeTestDb();
});
