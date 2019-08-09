// Globals

const MAX_RESULTS = 1000; // Free API Limit
const NUM_OF_REPOS_TO_SHOW = 3; // Free API Limit

let SEARCH_BTN = document.getElementById('searchBtn');
let USER_CARDS_CONTAINER = document.getElementById('userCards');
let USER_REPOS_CONTAINER = document.getElementById('userRepos');
let PAGINATION_CONTAINER = document.getElementById('pagination');

// Event Listeners

USER_CARDS_CONTAINER.addEventListener('click', (e) => {
	e.stopPropagation()
	const action = e.target.dataset.action;
	const id = e.target.dataset.id;
	const username = e.target.dataset.user;

	action === 'open' && fetchUserRepos(username);
	action === 'minimize' && minimizeItem(id);
});

USER_REPOS_CONTAINER.addEventListener('click', (e) => {
	e.stopPropagation()
	const url = e.target.dataset.url;

	url && window.open(url, 'blank');
});

SEARCH_BTN.addEventListener('click', () => {
	const searchField = document.getElementById('searchField');
    const username = searchField.value;

    if (!username) {
        alert(`Username can't be empty`);
        return;
    }

    fetchUsers(username);
});

const fetchUsers = (username, page = 1) => {
	clearUserCards();
	clearUserRepos();
	USER_CARDS_CONTAINER.innerHTML = renderLoader();
	const url = `https:/api.github.com/search/users?q=${username}&page=${page}`;
	request(url)
		.then(data => renderUserCards(data, username, page))
		.catch(error => alert(`Something went wrong: ${error}`));
}

const renderUserCards = (data, username, current_page) => {
	clearUserCards();
	const {items} = data;

	if(!items || !items.length) {
		alert('There are no users that match that query.');
		return;
	}

	renderPagination(items.length, username, current_page);
	items.forEach(item => {
		USER_CARDS_CONTAINER.innerHTML += renderUserCard(item);
	});
}

const fetchUserRepos = (username) => {
	clearUserRepos();
	USER_REPOS_CONTAINER.innerHTML = renderLoader();
	const url = `https:/api.github.com/users/${username}/repos`;
	request(url)
		.then(data => renderUserRepos(data))
		.catch(error => alert(`Something went wrong: ${error}`));
}

const renderUserRepos = (data) => {
	clearUserRepos();

	if(!data || !data.length) {
		alert('This user has no repos...');
		return;
	}

	const filteredRepos = data.sort((a,b) => {
		return b.stargazers_count - a.stargazers_count; // Sort in DESC order, by number of stars
	}).slice(0, NUM_OF_REPOS_TO_SHOW);

	filteredRepos.forEach(repo => {
		USER_REPOS_CONTAINER.innerHTML += renderUserRepoCard(repo);
	});
}

const renderUserCard = (data) => {
	const {id, login, url, avatar_url} = data;
	return `
		<div id='userCard_${id}' class='data_cards--card' data-action='open' data-user='${login}'>
			<div class='data_cards--card--avatar'>
				<img src='${avatar_url}' alt='${login} avatar'/>
			</div>
			<div class='data_cards--card--content'>
				<span>USERNAME: ${login}</span>
				<span>PROFILE URL: ${url}</span>
			</div>
			<span class='data_cards--card--minimize' data-id='${id}' data-action='minimize'>-</span>
		</div>
	`;
}

const renderUserRepoCard = (data) => {
	const {id, description, name, stargazers_count, language, html_url} = data;
	return `
		<div id='repoCard_${id}' class='data_cards--card' data-url='${html_url}'>
			<div class='data_cards--card--content'>
				<span>NAME: ${name}</span>
				<span>MAIN LANGUAGE: ${language || 'Unknown'}</span>
				<span>DESCRIPTION: ${description || 'No description...'}</span>
				<span>STARS: ${stargazers_count || 0}</span>
			</div>
		</div>
	`;
}

const renderLoader = () => {
	return `<div class='loader'></div>`;
}

const renderPagination = (per_page, username, current_page) => {
	const num_pages = Math.ceil(MAX_RESULTS / per_page);

	let pages = '';
    for (let i = 1; i <= num_pages; i++) {
		const className = i === current_page ? 'active' : '';
        pages += `<p class='${className}' onClick=fetchUsers('${username}',${i})>${i}</p>`;
    }

    PAGINATION_CONTAINER.innerHTML = pages;
}

const minimizeItem = (id) => {
    const card = document.getElementById(`userCard_${id}`);
	card.classList.toggle('minimized');
}

const clearUserCards = () => {
    USER_CARDS_CONTAINER.innerHTML = '';
}

const clearUserRepos = () => {
    USER_REPOS_CONTAINER.innerHTML = '';
}

// Helpers

const request = (url) => {
	return fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then(response => response.json());
}
