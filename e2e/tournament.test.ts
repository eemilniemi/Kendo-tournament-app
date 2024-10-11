import { test, expect } from '@playwright/test';
import { MongoClient } from 'mongodb';
import bcrypt from "bcryptjs";

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
    });
  
    //test to see if it is on right site
    test('has title', async ({ page }) => {
        console.log("has title");
        await expect(page).toHaveTitle("Kendo Tournament manager");
      });

    test('can login', async ({page}) => {
        console.log("can login");
        await page.goto('/login')
        await page.getByLabel('Sähköpostiosoite *').fill("test-user1@gmail.com");
        await page.getByLabel('Salasana *').fill("FooBar123");
        await page.getByRole('button', { name: 'Kirjaudu', exact: true }).click();
        
        const text = page.getByText('Tervetuloa KendoAppiin! Voit');
        await expect(text).toBeVisible();
    });

    test('can create a tournament', async ({page}) => {
        await page.goto('/login')
        
        await page.getByLabel('Sähköpostiosoite *').fill('test-user1@gmail.com');
        await page.getByLabel('Salasana *').fill('FooBar123');
        await page.getByLabel('Salasana *').press('Enter');
        const text = page.getByText('Tervetuloa KendoAppiin! Voit');
        await expect(text).toBeVisible();

        console.log("can create a tournament");

        const plusButton = page.getByRole('button', { name: '+' })
        await plusButton.click();
        await page.getByLabel('Turnauksen nimi *').fill("Testiturnaus");
        await page.getByLabel('Sijainti *').fill("Testipaikka");
        await page.getByLabel('Kuvaus *').fill("Testikuvaus");


        page.on('dialog', dialog => dialog.accept());

        await page.getByRole('button', { name: 'Luo' }).click();
        await page.getByRole('button', { name: 'Vahvista' }).click();
        await page.goto('/tournaments');
        const newTournament = page.getByRole('button', { name: 'Testiturnaus' })
        await expect(newTournament).toBeVisible();
    });

    test.afterAll(async () => {
        await client.close();
    });
});

