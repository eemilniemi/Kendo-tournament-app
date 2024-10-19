import { test, expect } from '@playwright/test';
import { MongoClient } from 'mongodb';
import bcrypt from "bcryptjs";
import * as Helper from './e2eTestHelpers';

require('dotenv').config({path: __dirname + '/../backend/server/.env'});

const uri = process.env.E2E_MONGODB_URL || 'mongodb://localhost:27017';
const client = new MongoClient(uri);


test.describe("Tournament tests", () => {
    
    test.beforeAll(async () => {
        await client.connect();
        const db = client.db('kendo_test');
        console.log("Connected to " + uri);

        await db.dropDatabase();
        await db.createCollection('users');

        const salt = await bcrypt.genSalt(10);
        const password = await bcrypt.hash("FooBar123", salt);

        const users = [
            {
                email: 'test-user1@gmail.com',
                userName: 'testUser1',
                firstName: 'Test1',
                lastName: 'User1',
                phoneNumber: '045123456789',
                password,
                inNationalTeam: false,
                underage: false
            },
            {
                email: 'test-user2@gmail.com',
                userName: 'testUser2',
                firstName: 'Test2',
                lastName: 'User2',
                phoneNumber: '046123456789',
                password,
                inNationalTeam: false,
                underage: false
            },
            {
                email: 'test-user3@gmail.com',
                userName: 'testUser3',
                firstName: 'Test3',
                lastName: 'User3',
                phoneNumber: '047123456789',
                password,
                inNationalTeam: false,
                underage: false
            },
            {
                email: 'test-user4@gmail.com',
                userName: 'testUser4',
                firstName: 'Test4',
                lastName: 'User4',
                phoneNumber: '048123456789',
                password,
                inNationalTeam: false,
                underage: false
            },
        ];

        await db.collection('users').insertMany(users);

    });

    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.getByText('FI', { exact: true }).click();
        await page.getByRole('option', { name: 'EN' }).click();
    });
  
    //test to see if it is on right site
    test('has title', async ({ page }) => {
        console.log("has title");
        await expect(page).toHaveTitle("Kendo Tournament manager");
      });

    test('can login', async ({page}) => {
        console.log("can login");

        await Helper.login(page, {email: 'test-user1@gmail.com', password: 'FooBar123'});
        
        const text = page.getByText('Welcome to KendoApp!');
        await expect(text).toBeVisible();
    });

    test('can create a tournament and join one', async ({page}) => {
        await Helper.login(page, {email: 'test-user1@gmail.com', password: 'FooBar123'});
        const text = page.getByText('Welcome to KendoApp!');
        await expect(text).toBeVisible();

        const currentDate = new Date();
        const startDate = new Date(currentDate.getTime() + 10 * 60000);
        const formattedStartDate = Helper.formatDate(startDate);

        await Helper.createTournament(page, {name: "TestTournament", location: "TestLocation", description: "TestDescription", startDate : formattedStartDate});
        await page.goto('/tournaments?tab=upcoming');
        const newTournament = page.getByRole('button', { name: 'TestTournament' })
        await expect(newTournament).toBeVisible();

        await Helper.joinTournament(page, 'TestTournament');

        const signedUp = page.getByText('Successfully signed up for')
        await expect(signedUp).toBeVisible();

    });

    test.afterAll(async () => {
        await client.close();
    });
});

