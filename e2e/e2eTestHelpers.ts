
async function login(page, user) {
    await page.goto('/login');
    await page.getByLabel('Email').fill(user.email);
    await page.getByLabel('Password').fill(user.password);
    await page.getByRole('button', { name: 'Log in' }).click();
}

async function createTournament(page, tournamentData) {

    console.log("can create a tournament");
    await page.goto('/tournaments/new-tournament')
    await page.getByLabel('Tournament Name *').fill(tournamentData.name);
    await page.getByLabel('Location *').fill(tournamentData.location);
    await page.getByLabel('Start date time *').fill(tournamentData.startDate);
    await page.getByLabel('Description *').fill(tournamentData.description);

    page.on('dialog', dialog => dialog.accept());

    await page.getByRole('button', { name: 'Create' }).click();
    await page.getByRole('button', { name: 'Confirm' }).click();
}

async function joinTournament(page, tournamentName){
    await page.goto('/tournaments?tab=upcoming')
    await page.getByRole('button', { name: tournamentName }).click();
    await page.getByRole('button', { name: 'Sign up' }).click();
    await page.getByRole('button', { name: 'Sign up' }).click();

}

function formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}`;
}

export{ login, createTournament, joinTournament, formatDate };
