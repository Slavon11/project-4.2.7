document.addEventListener('DOMContentLoaded', function () {

const searchInput = document.querySelector(".search-input")
const autocompleteList = document.querySelector(".autocomplete-list")
const repoList = document.querySelector(".repo-list")


// Функция debounce
function debounce(fn, delay = 400) {
let timer = null;
return function (...args) {
	if (timer !== null) {
		clearTimeout(timer);
	}
	timer = setTimeout(() => {
		fn.apply(this, args);
	}, delay);
};
};


// Запрос к GitHub API
async function fetchRepos(query) {
	if (!query.trim()) {
		autocompleteList.style.display = "none";
		return;
	}

	try {
		const response = await fetch(`https://api.github.com/search/repositories?q=${encodeURIComponent(query)}+in:name&per_page=5&sort=stars`)
		if (!response.ok){
			throw new Error(`GitHub API error: ${response.status}`)
		}
		const data = await response.json();
		const repos = data.items || [];
		showAutocomplete(repos);

	} catch (error) {
		console.error("Ошибка при запросе к GitHub:", error);
		autocompleteList.style.display = "none";
	}
};

//Отображение автокомплита
function showAutocomplete(repos) {
	autocompleteList.innerHTML = '';

	if (repos.length === 0) {
		autocompleteList.style.display = "none";
		return;
	}

	repos.forEach(repo => {
		const li = document.createElement("li");
		li.textContent = repo.name;
		li.addEventListener("click", () => addRepo(repo));
		autocompleteList.appendChild(li);
	});
	autocompleteList.style.display = 'block'
}

//Добавление репозитория
function addRepo(repo) {

	const repoItem = document.createElement("div");
	repoItem.classList.add("repo-item");
	
	const div = document.createElement("div");

	const name = document.createElement("p");
	name.textContent = `Name: ${repo.name}`;

	const owner = document.createElement('p');
	owner.textContent = `Owner: ${repo.owner.login}`;

	const stars = document.createElement('p');
	stars.textContent = `Stars: ${repo.stargazers_count}`;

div.append(name, owner, stars);

const deleteBtn = document.createElement("button");
	deleteBtn.classList.add("delete-btn");
	deleteBtn.addEventListener("click", () => {
		repoItem.remove();
	});

repoItem.append(div, deleteBtn);
repoList.appendChild(repoItem);


searchInput.value = '';
autocompleteList.innerHTML = '';
autocompleteList.style.display = 'none';

}

const debouncedFetch = debounce(fetchRepos, 400);
searchInput.addEventListener("input", function(e) {
	debouncedFetch(e.target.value);
});


document.addEventListener('click', (e) => {
	if (!autocompleteList.contains(e.target) && !searchInput.contains(e.target)) {
		autocompleteList.style.display = 'none';
	}
});

});