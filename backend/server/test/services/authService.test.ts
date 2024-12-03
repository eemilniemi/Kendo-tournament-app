import chaiAsPromised from "chai-as-promised";
import * as chai from "chai";
import {AuthService} from "../../src/services/authService";
import sinon, { SinonStub } from "sinon";
import UserModel from "../../src/models/userModel";
import MatchModel from "../../src/models/matchModel";
import {testUser} from "../testHelpers";
import BadRequestError from "../../src/errors/BadRequestError";
import {generateAccessToken, generateRefreshToken, verifyRefreshToken} from "../../src/utility/jwtHelper";
import * as jwtHelper from "../../src/utility/jwtHelper";
import {UnauthorizedError} from "express-jwt";

chai.use(chaiAsPromised);
const expect = chai.expect;

describe("AuthService", () => {
    let authService: AuthService;
    let generateAccessTokenStub: SinonStub;
    let generateRefreshTokenStub: SinonStub;


    let testPlayer1email: string;
    let testPlayer1password: string;

    let testPlayer2email: string;


    before (async () => {
        let testPlayer = await UserModel.findOne({userName: 'testUser'}).exec();
        let testPlayer2 = await UserModel.findOne({userName: 'testUser2'}).exec();

        testPlayer1email = testPlayer.email;
        testPlayer1password = testPlayer.password;

        testPlayer2email = testPlayer2.email;
    });

    beforeEach(() => {
        authService = new AuthService();
        sinon.restore();

    });

    afterEach(() => {
        sinon.restore();
    });

    describe("loginUser", () => {
        it("should return tokens and user details for valid credentials", async () => {

            const testUser = await UserModel.findOne({ userName: 'testUser' }).exec();
            console.log("Test User:", testUser);
            

            console.log("testPlayer1email: ", testPlayer1email);
            console.log("testPlayer1password: ", testPlayer1password);
            const loginRequest = { email: testPlayer1email, password: "FooBar123" };
            const response = await authService.loginUser(loginRequest);

            console.log(response);
            expect(response).to.have.property('accessToken');
            expect(response).to.have.property('refreshToken');
            expect(response.user).to.have.property('email', testUser.email);
            expect(response.user).to.have.property('userName', testUser.userName);
        });



        it("should throw an error if user is not found", async () => {


        });

        it("should throw an error if password is incorrect", async () => {

        });



    });



    describe("refreshAccessToken", () => {

        it("should throw an error if refresh token is not provided", async () => {

            const refreshToken = undefined;

            await expect(authService.refreshAccessToken(refreshToken)).to.be.rejectedWith(
                BadRequestError,
                "Refresh token not found"
            );
        });

        it("should throw an error if the refresh token is invalid", async () => {

        });

        it("should return a new access token and the existing refresh token", async () => {

        });




    });



    describe("sendPasswordRecoveryMail", () => {

        it("should send a password recovery email to the user", async () => {

        });

        it("should throw an error if the user is not found", async () => {

        });





    });





    describe("resetPassword", () => {

        it("should reset the password for a user", async () => {
            const mockToken = "validToken";
            const mockPassword = "newPassword123";
            const mockUser = {
                resetPasswordToken: mockToken,
                isPasswordResetTokenExpired: sinon.stub().returns(false),
                save: sinon.stub().resolves(),
                password: "",
                resetPasswordExpires: undefined,
            };

            sinon.stub(UserModel, "findOne").returns({
                exec: sinon.stub().resolves(mockUser),
            } as any);

            const requestBody = { token: mockToken, password: mockPassword };
            await authService.resetPassword(requestBody);

            expect(mockUser.isPasswordResetTokenExpired.calledOnce).to.be.true;
            expect(mockUser.password).to.equal(mockPassword);
            expect(mockUser.resetPasswordToken).to.be.undefined;
            expect(mockUser.resetPasswordExpires).to.be.undefined;
            expect(mockUser.save.calledOnce).to.be.true;


        });

        it("should throw an error if the token is invalid", async () => {

            const mockToken = "expiredToken";
            sinon.stub(UserModel, "findOne").returns({
                exec: sinon.stub().resolves(null),
            } as any);

            const requestBody = { token: mockToken, password: "newPassword123" };

            await expect(authService.resetPassword(requestBody)).to.be.rejectedWith(
                BadRequestError,
                "Invalid or expired reset token."
            );
        });

        it("should throw an error if the token is valid but expired", async () => {

            const mockToken = "validExpiredToken";
            const mockUser = {
                resetPasswordToken: mockToken,
                isPasswordResetTokenExpired: sinon.stub().returns(true),
            };

            sinon.stub(UserModel, "findOne").returns({
                exec: sinon.stub().resolves(mockUser),
            } as any);

            const requestBody = { token: mockToken, password: "newPassword123" };

            await expect(authService.resetPassword(requestBody)).to.be.rejectedWith(
                BadRequestError,
                "Invalid or expired reset token."
            );

            expect(mockUser.isPasswordResetTokenExpired.calledOnce).to.be.true;
        });

    });

});

