import { test, expect } from '@playwright/test';
import { MongoClient } from 'mongodb';
import bcrypt from "bcryptjs";
import * as Helper from './e2eTestHelpers';


//require('dotenv').config({path: __dirname + '/../backend/server/.env'});

const uri = "mongodb://127.0.0.1:27017/kendo_test";
const client = new MongoClient(uri);
const TIMEOUT_TIME = 300000;


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
            {
                email: 'test-user5@gmail.com',
                userName: 'testUser5',
                firstName: 'Test5',
                lastName: 'User5',
                phoneNumber: '049123456789',
                password,
                inNationalTeam: false,
                underage: false
            },
            {
                email: 'test-user6@gmail.com',
                userName: 'testUser6',
                firstName: 'Test6',
                lastName: 'User6',
                phoneNumber: '040223456789',
                password,
                inNationalTeam: false,
                underage: false
            },
            {
                email: 'test-user7@gmail.com',
                userName: 'testUser7',
                firstName: 'Test7',
                lastName: 'User7',
                phoneNumber: '040323456789',
                password,
                inNationalTeam: false,
                underage: false
            },
            {
                email: 'test-user8@gmail.com',
                userName: 'testUser8',
                firstName: 'Test8',
                lastName: 'User8',
                phoneNumber: '040423456789',
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

    test('4 player playoffs', async ({page}) => {
        test.setTimeout(60000);
        await Helper.login(page, {email: 'test-user1@gmail.com', password: 'FooBar123'});
        const text = page.getByText('Welcome to KendoApp!');
        await expect(text).toBeVisible();

        const currentDate = new Date();
        const startDate = new Date(currentDate.getTime() + 10 * 60000);
        const formattedStartDate = Helper.formatDate(startDate);

        await Helper.createTournament(page, 
            {   
                name: "TestTournament", 
                location: "TestLocation", 
                description: "TestDescription", 
                startDate : formattedStartDate, 
                tournamentType: "Playoff",
                maxPlayers: "4"
            });


        await Helper.joinTournament(page);
        await Helper.logout(page);

        await Helper.login(page, {email: 'test-user2@gmail.com', password: 'FooBar123'});
        await Helper.joinTournament(page);
        await Helper.logout(page);

        await Helper.login(page, {email: 'test-user3@gmail.com', password: 'FooBar123'});
        await Helper.joinTournament(page);
        await Helper.logout(page);

        await Helper.login(page, {email: 'test-user4@gmail.com', password: 'FooBar123'});
        await Helper.joinTournament(page);
        await Helper.logout(page);

        await Helper.login(page, {email: 'test-user1@gmail.com', password: 'FooBar123'});
        await Helper.editTournament(page, {startDate: Helper.formatDate(currentDate)});

        await Helper.openTournament(page, 'TestTournament');

        await Helper.completeMatch(page, 'Test1', 'Test2', 'Test2');
        await Helper.completeMatch(page, 'Test3', 'Test4', 'Test3');
        await Helper.completeMatch(page, 'Test2', 'Test3', 'Test2');
        await expect(page.getByText('WINNER: Test2')).toBeVisible();
    });

    test('5 player playoffs', async ({page}) => {
        test.setTimeout(TIMEOUT_TIME);
        await Helper.login(page, {email: 'test-user1@gmail.com', password: 'FooBar123'});
        const text = page.getByText('Welcome to KendoApp!');
        await expect(text).toBeVisible();

        const currentDate = new Date();
        const startDate = new Date(currentDate.getTime() + 10 * 60000);
        const formattedStartDate = Helper.formatDate(startDate);

        await Helper.createTournament(page, 
            {   
                name: "TestTournament", 
                location: "TestLocation", 
                description: "TestDescription", 
                startDate : formattedStartDate, 
                tournamentType: "Playoff",
                maxPlayers: "5",
            });


        await Helper.joinTournament(page);
        await Helper.logout(page);

        await Helper.login(page, {email: 'test-user2@gmail.com', password: 'FooBar123'});
        await Helper.joinTournament(page);
        await Helper.logout(page);

        await Helper.login(page, {email: 'test-user3@gmail.com', password: 'FooBar123'});
        await Helper.joinTournament(page);
        await Helper.logout(page);

        await Helper.login(page, {email: 'test-user4@gmail.com', password: 'FooBar123'});
        await Helper.joinTournament(page);
        await Helper.logout(page);

        await Helper.login(page, {email: 'test-user5@gmail.com', password: 'FooBar123'});
        await Helper.joinTournament(page);
        await Helper.logout(page);

        await Helper.login(page, {email: 'test-user1@gmail.com', password: 'FooBar123'});
        await Helper.editTournament(page, {startDate: Helper.formatDate(currentDate)});

        await Helper.openTournament(page, 'TestTournament');

        // Round 1
        await Helper.completeMatch(page, 'Test4', 'Test5', 'Test4');

        // Round 2
        await Helper.completeMatch(page, 'Test1', 'Test2', 'Test1');
        await Helper.completeMatch(page, 'Test3', 'Test4', 'Test4');

        // Final
        await Helper.completeMatch(page, 'Test1', 'Test4', 'Test4');
       
        await expect(page.getByText('WINNER: Test4')).toBeVisible();
    });

    test('5 player Preliminary groups and playoffs with 3 players per group and 2 proceeding', async ({page}) => {
        test.setTimeout(TIMEOUT_TIME);
        await Helper.login(page, {email: 'test-user1@gmail.com', password: 'FooBar123'});
        const text = page.getByText('Welcome to KendoApp!');
        await expect(text).toBeVisible();

        const currentDate = new Date();
        const startDate = new Date(currentDate.getTime() + 10 * 60000);
        const formattedStartDate = Helper.formatDate(startDate);

        await Helper.createTournament(page, 
            {   
                name: "TestTournament", 
                location: "TestLocation", 
                description: "TestDescription", 
                startDate : formattedStartDate, 
                tournamentType: "Preliminary groups and playoffs",
                maxPlayers: "5",
                playerCount: "3",
                playersProceeding: "2"
            });


        await Helper.joinTournament(page);
        await Helper.logout(page);

        await Helper.login(page, {email: 'test-user2@gmail.com', password: 'FooBar123'});
        await Helper.joinTournament(page);
        await Helper.logout(page);

        await Helper.login(page, {email: 'test-user3@gmail.com', password: 'FooBar123'});
        await Helper.joinTournament(page);
        await Helper.logout(page);

        await Helper.login(page, {email: 'test-user4@gmail.com', password: 'FooBar123'});
        await Helper.joinTournament(page);
        await Helper.logout(page);

        await Helper.login(page, {email: 'test-user5@gmail.com', password: 'FooBar123'});
        await Helper.joinTournament(page);
        await Helper.logout(page);

        await Helper.login(page, {email: 'test-user1@gmail.com', password: 'FooBar123'});
        await Helper.editTournament(page, {startDate: Helper.formatDate(currentDate)});

        await page.getByRole('button', { name: 'TestTournament' }).click();

        // Preliminary
        // Group 1

        await page.getByRole('button', { name: 'Group 1 Name Points Ippons' }).click(); 
        await Helper.completeMatch(page, 'Test3', 'Test1', 'Test1', 'Preliminary groups and playoffs');
        await page.getByRole('button', { name: 'Group 1 Name Points Ippons' }).click(); 
        await Helper.completeMatch(page, 'Test5', 'Test1', 'Test1', 'Preliminary groups and playoffs');
        await page.getByRole('button', { name: 'Group 1 Name Points Ippons' }).click(); 
        await Helper.completeMatch(page, 'Test5', 'Test3', 'Test3', 'Preliminary groups and playoffs');

        // Group 2
        await page.getByRole('button', { name: 'Group 2 Name Points Ippons' }).click();
        await Helper.completeMatch(page, 'Test4', 'Test2', 'Test2', 'Preliminary groups and playoffs');

        // Playoffs
        // Round 1
        await page.getByRole('tab', { name: 'Playoff' }).click();
        await Helper.completeMatch(page, 'Test1', 'Test3', 'Test1');
        await Helper.completeMatch(page, 'Test2', 'Test4', 'Test4');

        // Round 2
        await Helper.completeMatch(page, 'Test1', 'Test4', 'Test4');
        await expect(page.getByText('WINNER: Test4')).toBeVisible();
    });

    test('8 player Preliminary groups and playoffs with 4 players per group and 2 proceeding', async ({page}) => {
        test.setTimeout(TIMEOUT_TIME);
        await Helper.login(page, {email: 'test-user1@gmail.com', password: 'FooBar123'});
        const text = page.getByText('Welcome to KendoApp!');
        await expect(text).toBeVisible();

        const currentDate = new Date();
        const startDate = new Date(currentDate.getTime() + 10 * 60000);
        const formattedStartDate = Helper.formatDate(startDate);

        await Helper.createTournament(page, 
            {   
                name: "TestTournament", 
                location: "TestLocation", 
                description: "TestDescription", 
                startDate : formattedStartDate, 
                tournamentType: "Preliminary groups and playoffs",
                maxPlayers: "8",
                playerCount: "4",
                playersProceeding: "2"
            });


        await Helper.joinTournament(page);
        await Helper.logout(page);

        await Helper.login(page, {email: 'test-user2@gmail.com', password: 'FooBar123'});
        await Helper.joinTournament(page);
        await Helper.logout(page);

        await Helper.login(page, {email: 'test-user3@gmail.com', password: 'FooBar123'});
        await Helper.joinTournament(page);
        await Helper.logout(page);

        await Helper.login(page, {email: 'test-user4@gmail.com', password: 'FooBar123'});
        await Helper.joinTournament(page);
        await Helper.logout(page);

        await Helper.login(page, {email: 'test-user5@gmail.com', password: 'FooBar123'});
        await Helper.joinTournament(page);
        await Helper.logout(page);
        
        await Helper.login(page, {email: 'test-user6@gmail.com', password: 'FooBar123'});
        await Helper.joinTournament(page);
        await Helper.logout(page);
        
        await Helper.login(page, {email: 'test-user7@gmail.com', password: 'FooBar123'});
        await Helper.joinTournament(page);
        await Helper.logout(page);
        
        await Helper.login(page, {email: 'test-user8@gmail.com', password: 'FooBar123'});
        await Helper.joinTournament(page);
        await Helper.logout(page);
        
        await Helper.login(page, {email: 'test-user1@gmail.com', password: 'FooBar123'});
        await Helper.editTournament(page, {startDate: Helper.formatDate(currentDate)});

        await page.getByRole('button', { name: 'TestTournament' }).click();
        // Preliminary
        // Group 1

        await page.getByRole('button', { name: 'Group 1 Name Points Ippons' }).click(); 
        await Helper.completeMatch(page, 'Test7', 'Test1', 'Test7', 'Preliminary groups and playoffs');
        await page.getByRole('button', { name: 'Group 1 Name Points Ippons' }).click(); 
        await Helper.completeMatch(page, 'Test7', 'Test3', 'Test7', 'Preliminary groups and playoffs');
        await page.getByRole('button', { name: 'Group 1 Name Points Ippons' }).click(); 
        await Helper.completeMatch(page, 'Test5', 'Test3', 'Test3', 'Preliminary groups and playoffs');
        await page.getByRole('button', { name: 'Group 1 Name Points Ippons' }).click(); 
        await Helper.completeMatch(page, 'Test7', 'Test5', 'Test5', 'Preliminary groups and playoffs');
        await page.getByRole('button', { name: 'Group 1 Name Points Ippons' }).click(); 
        await Helper.completeMatch(page, 'Test3', 'Test1', 'Test1', 'Preliminary groups and playoffs');
        await page.getByRole('button', { name: 'Group 1 Name Points Ippons' }).click(); 
        await Helper.completeMatch(page, 'Test5', 'Test1', 'Test1', 'Preliminary groups and playoffs');


        // Group 2
        
        await page.getByRole('button', { name: 'Group 2 Name Points Ippons' }).click(); 
        await Helper.completeMatch(page, 'Test6', 'Test2', 'Test2', 'Preliminary groups and playoffs');
        await page.getByRole('button', { name: 'Group 2 Name Points Ippons' }).click(); 
        await Helper.completeMatch(page, 'Test6', 'Test4', 'Test4', 'Preliminary groups and playoffs');
        await page.getByRole('button', { name: 'Group 2 Name Points Ippons' }).click(); 
        await Helper.completeMatch(page, 'Test8', 'Test2', 'Test2', 'Preliminary groups and playoffs');
        await page.getByRole('button', { name: 'Group 2 Name Points Ippons' }).click(); 
        await Helper.completeMatch(page, 'Test8', 'Test4', 'Test4', 'Preliminary groups and playoffs');
        await page.getByRole('button', { name: 'Group 2 Name Points Ippons' }).click(); 
        await Helper.completeMatch(page, 'Test8', 'Test6', 'Test8', 'Preliminary groups and playoffs');
        await page.getByRole('button', { name: 'Group 2 Name Points Ippons' }).click(); 
        await Helper.completeMatch(page, 'Test4', 'Test2', 'Test2', 'Preliminary groups and playoffs');

        // Playoffs
        // Round 1

        await page.getByRole('tab', { name: 'Playoff' }).click();
        await Helper.completeMatch(page, 'Test1', 'Test7', 'Test1');
        await Helper.completeMatch(page, 'Test2', 'Test4', 'Test4');

        // Round 2

        await Helper.completeMatch(page, 'Test1', 'Test4', 'Test4');
        await expect(page.getByText('WINNER: Test4')).toBeVisible();
    });

    // Not sure how swiss should work
    /*test('5 player swiss', async ({page}) => {
        test.setTimeout(TIMEOUT_TIME);
        await Helper.login(page, {email: 'test-user1@gmail.com', password: 'FooBar123'});
        const text = page.getByText('Welcome to KendoApp!');
        await expect(text).toBeVisible();

        const currentDate = new Date();
        const startDate = new Date(currentDate.getTime() + 10 * 60000);
        const formattedStartDate = Helper.formatDate(startDate);

        await Helper.createTournament(page, 
            {   
                name: "TestTournament", 
                location: "TestLocation", 
                description: "TestDescription", 
                startDate : formattedStartDate, 
                tournamentType: "Swiss",
                maxPlayers: "5",
                rounds: "3"
            });


        await Helper.joinTournament(page);
        await Helper.logout(page);

        await Helper.login(page, {email: 'test-user2@gmail.com', password: 'FooBar123'});
        await Helper.joinTournament(page);
        await Helper.logout(page);

        await Helper.login(page, {email: 'test-user3@gmail.com', password: 'FooBar123'});
        await Helper.joinTournament(page);
        await Helper.logout(page);

        await Helper.login(page, {email: 'test-user4@gmail.com', password: 'FooBar123'});
        await Helper.joinTournament(page);
        await Helper.logout(page);

        await Helper.login(page, {email: 'test-user5@gmail.com', password: 'FooBar123'});
        await Helper.joinTournament(page);
        await Helper.logout(page);

        await Helper.login(page, {email: 'test-user1@gmail.com', password: 'FooBar123'});
        await Helper.editTournament(page, {startDate: Helper.formatDate(currentDate)});

        await page.getByRole('button', { name: 'TestTournament' }).click();

        await page.getByRole('tab', { name: 'Matches' }).click();
        
        

        // Round 1
        await Helper.completeMatch(page, 'Test1', 'Test2', 'Test2');
        await Helper.completeMatch(page, 'Test3', 'Test4', 'Test4');
        // Round 2
        await Helper.completeMatch(page, 'Test4', 'Test5', 'Test4');
        await Helper.completeMatch(page, 'Test1', 'Test3', 'Test1');
        // Round 3
        await Helper.completeMatch(page, 'Test2', 'Test1', 'Test1');
        await Helper.completeMatch(page, 'Test5', 'Test3', 'Test3');
       
        await expect(page.getByText('WINNER: Test4')).toBeVisible();
    });
    */

    test('5 player round robin', async ({page}) => {
        test.setTimeout(TIMEOUT_TIME);
        await Helper.login(page, {email: 'test-user1@gmail.com', password: 'FooBar123'});
        const text = page.getByText('Welcome to KendoApp!');
        await expect(text).toBeVisible();

        const currentDate = new Date();
        const startDate = new Date(currentDate.getTime() + 10 * 60000);
        const formattedStartDate = Helper.formatDate(startDate);

        await Helper.createTournament(page, 
            {   
                name: "TestTournament", 
                location: "TestLocation", 
                description: "TestDescription", 
                startDate : formattedStartDate, 
                tournamentType: "Round Robin",
                maxPlayers: "5"
            });


        await Helper.joinTournament(page);
        await Helper.logout(page);

        await Helper.login(page, {email: 'test-user2@gmail.com', password: 'FooBar123'});
        await Helper.joinTournament(page);
        await Helper.logout(page);

        await Helper.login(page, {email: 'test-user3@gmail.com', password: 'FooBar123'});
        await Helper.joinTournament(page);
        await Helper.logout(page);

        await Helper.login(page, {email: 'test-user4@gmail.com', password: 'FooBar123'});
        await Helper.joinTournament(page);
        await Helper.logout(page);

        await Helper.login(page, {email: 'test-user5@gmail.com', password: 'FooBar123'});
        await Helper.joinTournament(page);
        await Helper.logout(page);

        await Helper.login(page, {email: 'test-user1@gmail.com', password: 'FooBar123'});
        await Helper.editTournament(page, {startDate: Helper.formatDate(currentDate)});

        await page.getByRole('button', { name: 'TestTournament' }).click();
        await page.getByRole('tab', { name: 'Matches' }).click();

        await Helper.completeMatch(page, 'Test2', 'Test1', 'Test1', 'Round Robin');
        await Helper.completeMatch(page, 'Test3', 'Test1', 'Test1', 'Round Robin');
        await Helper.completeMatch(page, 'Test3', 'Test2', 'Test2', 'Round Robin');
        await Helper.completeMatch(page, 'Test4', 'Test1', 'Test4', 'Round Robin');
        await Helper.completeMatch(page, 'Test4', 'Test2', 'Test2', 'Round Robin');
        await Helper.completeMatch(page, 'Test4', 'Test3', 'Test3', 'Round Robin');
        await Helper.completeMatch(page, 'Test5', 'Test1', 'Test1', 'Round Robin');
        await Helper.completeMatch(page, 'Test5', 'Test2', 'Test2', 'Round Robin');
        await Helper.completeMatch(page, 'Test5', 'Test3', 'Test5', 'Round Robin');
        await Helper.completeMatch(page, 'Test5', 'Test4', 'Test5', 'Round Robin');
       
        await expect(page.getByText('WINNER: Test1')).toBeVisible();
    });



    test.afterAll(async () => {
        await client.close();
    });
});

