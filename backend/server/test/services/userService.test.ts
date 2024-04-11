import { describe, beforeEach, afterEach } from "mocha";
import { expect } from "chai";
import sinon, { SinonStub } from "sinon";
import * as Helper from "../testHelpers.ts";
import { type User } from "../../src/models/userModel.ts";
import { UserService } from "../../src/services/userService.ts";
import NotFoundError from "../../src/errors/NotFoundError.ts";

describe('UserService', () => {
    let userService: UserService;
    let getUserDocumentByIdStub: SinonStub;

    beforeEach(() => {
      userService = new UserService();
      getUserDocumentByIdStub = sinon.stub(userService, 'getUserDocumentById');
    });
  
    afterEach(() => {
      sinon.restore();
    });

    describe('getUserById', () => {
        it('should return user object by ID', async () => {
            const user: User = Helper.testUser;
            getUserDocumentByIdStub.resolves(user);

            const result = await userService.getUserById('123123123123');
            console.log(result);

            expect(result).to.deep.equal(user);
        });

        it('should throw NotFoundError if user is not found', async () => {
            getUserDocumentByIdStub.rejects(new NotFoundError());

            //expect(userService.getUserById('123123123123')).to.reject;
        });
    });

    describe('registerUser', () => {
        // TODO
    });

    describe('updateUserById', () => {
        // TODO
    });

    describe('deleteUserById', () => {
        // TODO
    });
});