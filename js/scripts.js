document.addEventListener('DOMContentLoaded', function () {
	handleTabs();
	handleSwitches();
	setElHeightAndWidth(document.querySelector('div[data-tab="games"]'));
	const eGridDiv = document.querySelector('#game-grid');
	new agGrid.Grid(eGridDiv, gridOptions);
	getFavorites(gameData);
	document.querySelector('#total-data').textContent = gameData.length;
	getUniquePlatforms(gameData);
});

function handleTabs() {
	// Get the nav and content elements
	const tabNavEls = document.querySelectorAll('.tabs ul > li');
	const tabContentEls = document.querySelectorAll('.tabs-content > div');
	// Add click event to tab navigation els
	for (i = 0; i < tabNavEls.length; i++) {
		tabNavEls[i].addEventListener('click', function () {
			const target = this.dataset.tab;
			// Remove the active style from all nav els
			for (nav = 0; nav < tabNavEls.length; nav++) {
				tabNavEls[nav].classList.remove('is-active');
			}
			// Add the active style class to clicked nav el
			this.classList.add('is-active');
			// Hide all tab content els
			for (content = 0; content < tabContentEls.length; content++) {
				tabContentEls[content].setAttribute('style', 'display:none');
			}
			// Find target tab content el and show it
			const targetContent = document.querySelector(
				'.tabs-content > div[data-tab="' + target + '"]'
			);
			targetContent.setAttribute('style', 'display:block');
		});
	}
}

function handleSwitches() {
	const switches = document.querySelectorAll('.pip-switch');
	switches.forEach((el) => {
		el.addEventListener('click', function () {
			const action = el.dataset.switch;
			if (action === 'theme') {
				themeSwitch();
			} else {
				triggerTab(action);
				switches.forEach((item) => {
					item.classList.remove('is-active');
				});
				el.classList.add('is-active');
			}
		});
	});
}

function themeSwitch() {
	const app = document.querySelector('#app');
	const currentTheme = app.dataset.theme;
	if (currentTheme === 'wasteland') {
		app.dataset.theme = 'newvegas';
	} else {
		app.dataset.theme = 'wasteland';
	}
}

function triggerTab(tab) {
	const target = document.querySelector('.tabs li[data-tab="' + tab + '"]');
	target.click();
}

function getUniquePlatforms(data) {
	let platformArrs = [];
	for (let i = 0; i < data.length; i++) {
		platformArrs.push(data[i].platforms);
		if (i === data.length - 1) {
			let merged = [].concat.apply([], platformArrs);
			let counts = {};
			for (let p = 0; p < merged.length; p++) {
				const num = merged[p];
				counts[num] = counts[num] ? counts[num] + 1 : 1;
			}
			const ordered = {};
			Object.keys(counts)
				.sort()
				.forEach(function (key) {
					ordered[key] = counts[key];
				});
			let sorted = [];
			for (let platform in counts) {
				sorted.push([platform, counts[platform]]);
			}
			sorted.sort(function (a, b) {
				return b[1] - a[1];
			});
			renderPlatforms(sorted);
		}
	}
}

function renderPlatforms(data) {
	let listItems = ``;
	data.forEach((el) => {
		const newEl = `<li><span>${el[1]}</span><span>${el[0]}</span></li>`;
		listItems = listItems + newEl;
	});
	const newList = `<ul>${listItems}</ul>`;
	const listContainer = document.querySelector('#platform-data');
	listContainer.innerHTML = newList;
}

function getFavorites(data) {
	let favorites = data.filter(function (item) {
		if (item.hearts > 0) {
			return item;
		}
	});
    favorites.sort(dynamicSort('title'));
    console.log(favorites)
	favorites.sort(function (a, b) {
		const rankA = a.hearts;
		const rankB = b.hearts;
		let comparison = 0;
		if (rankA > rankB) {
			comparison = -1;
		} else if (rankA < rankB) {
			comparison = 1;
		}
		return comparison;
	});
	let favEls = '';
	favorites.forEach(function (el) {
		let newEl;
		let heartEls = '';
		for (let i = 0; i < el.hearts; i++) {
			heartEls = heartEls + '<i class="fas fa-heart"></i>';
		}
		newEl = `<li>${heartEls}<span>${el.title}</span></li>`;
		favEls = favEls + newEl;
	});
	const favContainer = document.querySelector('#favorites ul');
	favContainer.innerHTML = favEls;
}

function compareByKeyValue(a, b) {
	// Use toUpperCase() to ignore character casing
	const valA = a[keyName].toUpperCase();
	const valB = b[keyName].toUpperCase();

	let comparison = 0;
	if (valA > valB) {
		comparison = 1;
	} else if (valA < valB) {
		comparison = -1;
	}
	return comparison;
}

// game grid
const columnDefs = [
	{
		headerName: 'Game',
		field: 'title',
		cellRenderer: (params) => {
			if (params.data.wikipedia) {
				return (
					'<a href="' +
					params.data.wikipedia +
					'" target="_blank" class="game-link">' +
					params.value +
					'</a>'
				);
			} else {
				return params.value;
			}
		},
	},
	{
		headerName: 'Released (NA)',
		field: 'releaseDate',
		sort: 'desc',
	},
	{
		headerName: 'Developer',
		field: 'developers',
		sortable: false,
	},
	{
		headerName: 'Publisher (NA)',
		field: 'publishers',
		sortable: false,
	},
];

const gridOptions = {
	columnDefs: columnDefs,
	defaultColDef: {
		filter: 'agTextColumnFilter',
		sortable: true,
		resizable: true,
		filter: true,
		suppressMenu: true,
		floatingFilterComponentParams: { suppressFilterButton: true },
	},
	rowData: gameData,
	floatingFilter: true,
	rowClass: 'game-row',
	onFirstDataRendered: onFirstDataRendered,
};

function onFirstDataRendered(params) {
	params.api.sizeColumnsToFit();
}

function autoSizeAll() {
	let allColumnIds = [];
	gridOptions.columnApi.getAllColumns().forEach(function (column) {
		allColumnIds.push(column.colId);
	});
	gridOptions.columnApi.autoSizeColumns(allColumnIds);
}

function setElHeightAndWidth(el, paddingOnly) {
	const h = el.offsetHeight;
	const w = el.offsetWidth;
	if (paddingOnly) {
		h = el.clientHeight;
		w = el.clientWidth;
	}
	el.style.height = h + 'px';
	el.style.width = w + 'px';
}

function dynamicSort(property) {
	var sortOrder = 1;
	if (property[0] === '-') {
		sortOrder = -1;
		property = property.substr(1);
	}
	return function (a, b) {
		var result =
			a[property] < b[property] ? -1 : a[property] > b[property] ? 1 : 0;
		return result * sortOrder;
	};
}
