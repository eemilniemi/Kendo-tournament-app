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
import NotFoundError from "../../src/errors/NotFoundError";

chai.use(chaiAsPromised);
const expect = chai.expect;

describe("AuthService", () => {
    let authService: AuthService;
    // let generateAccessTokenStub: SinonStub;
    // let generateRefreshTokenStub: SinonStub;

    let testUser1email: string;
    let testUser1Username: string;

    // Passwords are hashed, so we need to use the actual password here
    let testUser1password = "FooBar123";



    before (async () => {
        let testUser = await UserModel.findOne({userName: 'testUser'}).exec();
        testUser1email = testUser.email;
        testUser1Username = testUser.userName;

    });

    beforeEach(() => {
        authService = new AuthService();

    });

    afterEach(() => {
        sinon.restore();
    });

    describe("loginUser", () => {

        it("should return tokens and user details for valid credentials", async () => {
            // const testUser = await UserModel.findOne({ userName: 'testUser' }).exec();
            // console.log("Test User:", testUser);
            // console.log("testPlayer1email: ", testPlayer1email);
            // console.log("testPlayer1password: ", testPlayer1password);
            const loginRequest = {email: testUser1email, password: testUser1password};
            const res = await authService.loginUser(loginRequest);

            //console.log(res);
            expect(res).to.have.property('accessToken');
            expect(res).to.have.property('refreshToken');
            expect(res.user).to.have.property('email', testUser1email);
            expect(res.user).to.have.property('userName', testUser1Username);
        });

        it("should throw an error if user is not found", async () => {
            const loginRequest = {email: "NotExisting123@gmail.com", password: "NotExistingUserPassword"};
            await expect(authService.loginUser(loginRequest)).to.be.rejectedWith(
                BadRequestError, "No user found with the given email");
        });

        it("should throw an error if password is incorrect", async () => {
            const loginRequest = {email: testUser1email, password: "wrongPassword"};
            await expect(authService.loginUser(loginRequest)).to.be.rejectedWith(
                BadRequestError, "Invalid password");
        });
    });

    describe("refreshAccessToken", () => {

        it("should throw an error if refresh token is not provided", async () => {
            const refreshToken = undefined;
            await expect(authService.refreshAccessToken(refreshToken)).to.be.rejectedWith(
                BadRequestError, "Refresh token not found");
        });

        it("should throw an error if the refresh token is invalid", async () => {
            const invalidRefreshToken = "invalidRefreshToken";
            await expect(authService.refreshAccessToken(invalidRefreshToken)).to.be.rejectedWith(
                "jwt malformed");
        });

        it("should return a new access token and the existing refresh token", async () => {

            //console.log("Test User:", testUser);
            // console.log("testPlayer1email: ", testPlayer1email);
            // console.log("testPlayer1password: ", testPlayer1password);
            const loginRequest = {email: testUser1email, password: testUser1password};
            const res = await authService.loginUser(loginRequest);

            const accessToken = res.accessToken;
            const refreshToken = res.refreshToken;


            console.log("Access Token:", accessToken);
            console.log("Refresh Token:", refreshToken);


            // console.log("Test User:", testUser);
            // const decoded = await jwtHelper.verifyRefreshToken(refreshToken);
            // const user = await UserModel.findById(decoded.id).exec();
            // user.refreshToken = refreshToken;
            // await user.save();

            const tokens = await authService.refreshAccessToken(refreshToken);
            console.log(tokens);

            expect(tokens).to.be.an("array").that.has.lengthOf(2);
            expect(tokens[0]).to.be.a("string").and.equal(accessToken); // Should old and new access tokens be the same?
            expect(tokens[1]).to.be.a("string").and.equal(refreshToken);
            expect(tokens[0]).not.equal(tokens[1]); // Access and refresh tokens  should be different
        });

    });



    describe("sendPasswordRecoveryMail", () => {

        it("should send a password recovery email to the user", async () => {

        });

        it("should throw an error if the user is not found", async () => {

            const nonExistentEmail = "nonexistentuser@example.com"; // Simulate a non-existent user

            // Mock the behavior of UserModel.findOne to return null for the given email
            const testUser = await UserModel.findOne({ userName: 'testUser99' }).exec();

            // Assert that the function throws a BadRequestError with the appropriate message
            await expect(authService.sendPasswordRecoveryMail(nonExistentEmail))
                .to.be.rejectedWith(undefined);

            // Restore the original UserModel.findOne method
            sinon.restore();


        });

    });


    describe("resetPassword", () => {

        it("should reset the password for a user", async () => {
            // const mockToken = "validToken";
            // const mockPassword = "newPassword123";
            // const mockUser = {
            //     resetPasswordToken: mockToken,
            //     isPasswordResetTokenExpired: sinon.stub().returns(false),
            //     save: sinon.stub().resolves(),
            //     password: "",
            //     resetPasswordExpires: undefined,
            // };
            //
            // sinon.stub(UserModel, "findOne").returns({
            //     exec: sinon.stub().resolves(mockUser),
            // } as any);
            //
            // const requestBody = { token: mockToken, password: mockPassword };
            // await authService.resetPassword(requestBody);
            //
            // expect(mockUser.isPasswordResetTokenExpired.calledOnce).to.be.true;
            // expect(mockUser.password).to.equal(mockPassword);
            // expect(mockUser.resetPasswordToken).to.be.undefined;
            // expect(mockUser.resetPasswordExpires).to.be.undefined;
            // expect(mockUser.save.calledOnce).to.be.true;

            const testUser = await UserModel.findOne({ userName: 'testUser' }).exec();
            console.log("Test User:", testUser);

             const mockToken = "validToken";
            // const mockPassword = "newPassword123";
            // const mockUser = {
            //     resetPasswordToken: mockToken,
            //     isPasswordResetTokenExpired: sinon.stub().returns(false),
            //     save: sinon.stub().resolves(),
            //     password: "",
            //     resetPasswordExpires: undefined,
            // };

            //sinon.stub(UserModel, "findOne").returns({exec: sinon.stub().resolves(testUser),} as any);

            const requestBody = { token: mockToken, password: testUser1password };
            await authService.resetPassword(requestBody);

            expect(testUser.isPasswordResetTokenExpired.call(testUser)).to.be.true;
            expect(testUser1password).to.equal(mockPassword);
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

