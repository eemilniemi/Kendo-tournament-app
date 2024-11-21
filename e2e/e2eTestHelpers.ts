import { MongoClient } from 'mongodb';
import bcrypt from 'bcrypt';


async function initializeDatabase(uri, dbName) {
    const client = new MongoClient(uri);
    await client.connect();

    const db = client.db(dbName);
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
}

async function login(page, user) {
    await page.goto('/login');
    await page.getByLabel('Email').fill(user.email);
    await page.getByLabel('Password').fill(user.password);
    await page.getByRole('button', { name: 'Log in' }).click();
}

async function logout(page){
    await page.goto('./')
    await page.getByLabel('Open settings').click();
    await page.getByRole('menuitem', { name: 'Logout' }).click();
}

async function createTournament(page, tournamentData) {
    await page.goto('/tournaments/new-tournament')
    await page.getByLabel('Tournament Name *').fill(tournamentData.name);
    await page.getByLabel('Location *').fill(tournamentData.location);
    await page.getByLabel('Start date time *').fill(tournamentData.startDate);
    await page.getByLabel('Description *').fill(tournamentData.description);

    await page.getByLabel('Round Robin').click();
    
    switch (tournamentData.tournamentType) {
        case 'Round Robin':
            await page.getByRole('option', { name: 'Round Robin', exact: true }).click();
            break;
        case 'Playoff':
            await page.getByRole('option', { name: 'Playoff', exact: true }).click();
            break;
        case 'Preliminary groups and playoffs':
            await page.getByRole('option', { name: 'Preliminary groups and' }).click();
            await page.getByLabel('Group max size (players) *').fill(tournamentData.playerCount);
            await page.getByLabel('Players proceeding to').fill(tournamentData.playersProceeding);
            break;
        case 'Swiss':
            await page.getByRole('option', { name: 'Swiss' }).click();
            await page.getByLabel('Number of swiss rounds *').fill(tournamentData.rounds);
            break;
        default:
            await page.getByRole('option', { name: 'Round Robin', exact: true }).click();
            break;
        }
    
    await page.getByLabel('Maximum number of players *').fill(tournamentData.maxPlayers);

    await page.keyboard.press('PageDown');

    page.on('dialog', dialog => dialog.accept());

    await page.getByRole('button', { name: 'Create' }).click();
    await page.getByRole('button', { name: 'Confirm' }).click();
}

async function editTournament(page, tournamentData){
    await page.getByRole('button', { name: 'Edit' }).click();
    await page.getByLabel('Start date time *').fill(tournamentData.startDate);

    await page.keyboard.press('PageDown');

    page.on('dialog', dialog => dialog.accept());

    await page.getByRole('button', { name: 'Save changes' }).click();
    await page.getByRole('button', { name: 'Confirm' }).click();
}

async function joinTournament(page){
    await page.getByRole('button', { name: 'Sign up' }).click();
    await page.getByRole('button', { name: 'Sign up' }).click();
}

async function openTournament(page, tournamentName){
    await page.getByRole('button', { name: `${tournamentName}` }).click();
    await page.getByRole('button', { name: `${tournamentName}` }).click();
}

async function completeMatch(page, player1, player2, winningPlayer, gameType = 'Playoffs') {
    switch (gameType) {
        case 'Round Robin':
        case 'Preliminary groups and playoffs':
            await page.getByText(`${player1} - ${player2}  Court: `).click();
            break;
        default:
            await page.getByRole('button', { name: `${player1} vs ${player2}  Missing: Time` }).click();
            break;
    }
    
    await page.getByRole('button', { name: 'Select role as an official' }).click();
    await page.getByLabel('Time keeper').click();
    await page.getByLabel('Point maker').click();
    await page.getByRole('button', { name: 'Save' }).click();
    await page.getByRole('button', { name: 'Start' }).click();
    await page.getByRole('button', { name: `Add point for ${winningPlayer}` }).click();
    await page.getByLabel('M').click();
    await page.getByRole('button', { name: 'OK' }).click();
    await page.getByRole('button', { name: 'Start' }).click();
    await page.getByRole('button', { name: `Add point for ${winningPlayer}` }).click();
    await page.getByLabel('M').click();
    await page.getByRole('button', { name: 'OK' }).click();
    await page.locator('#back-button').click();
}




function formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}`;
}

export{ initializeDatabase, login, logout, createTournament, editTournament, joinTournament, openTournament, completeMatch, formatDate };
