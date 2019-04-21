var columnDefs = [
    {
        headerName: '',
        field: 'favorite',
        filter: false,
        suppressMenu: true,
        width: 50,
        cellRenderer: (params) => {
            if (params.value) {
                return '<i class="fas fa-heart full-heart"></i>'
            } else {
                return'<i class="far fa-heart no-heart"></i>';
            }
        }
    },
    {
        headerName: 'Game',
        field: 'title',
        cellRenderer: (params) => {
            if (params.data.wikipedia) {
                return '<a href="' + params.data.wikipedia + '" target="_blank" class="game-link">' + params.value + '</a>';
            } else {
                return params.value;
            }
        }
    },
    {
        headerName: 'Platforms Played',
        field: 'platforms',
        sortable: false,
        filterParams: { values: ['PlayStation 2'] },
    },
    {
        headerName: 'Released (NA)',
        field: 'releaseDate',
        sort: 'desc',
        cellRenderer: (params) => {
            if (params.value) {
                var len = (params.value).length;
                if (len === 4) {
                    return moment(params.value).format('YYYY');
                } else if (len === 7) {
                    return moment(params.value).format('MMMM YYYY');
                } else if (len === 10) {
                    return moment(params.value).format('MMMM D, YYYY');
                }
            } else {
                return 'N/A';
            }
        }
    },
    
    {
        headerName: 'Developer',
        field: 'developers',
        sortable: false
    },
    {
        headerName: 'Publisher (NA)',
        field: 'publishers',
        sortable: false
    }
];

var gridOptions = {
    columnDefs: columnDefs,
    defaultColDef: {
        filter: 'agTextColumnFilter',
        sortable: true,
        resizable: true,
        filter: true,
        suppressMenu: true,
    floatingFilterComponentParams: {suppressFilterButton:true}
    },
    rowData: gameData,
    floatingFilter: true,
    rowClass: 'game-row',
    onFirstDataRendered: onFirstDataRendered
    // sideBar: 'filters', // ent-only
    //components: {}
};

function onFirstDataRendered(params) {
    params.api.sizeColumnsToFit();
}

function autoSizeAll() {
    var allColumnIds = [];
    gridOptions.columnApi.getAllColumns().forEach(function(column) {
        allColumnIds.push(column.colId);
    });
    gridOptions.columnApi.autoSizeColumns(allColumnIds);
}
document.addEventListener('DOMContentLoaded', function () {
    var eGridDiv = document.querySelector('#game-grid');
    new agGrid.Grid(eGridDiv, gridOptions);
});

// Determine totals
totalGames(gameData);

function totalGames(data) {

    const total = data.length;

    let sony = 0;
    let microsoft = 0;
    let nintendo = 0;

    for (i = 0; i < gameData.length; i++) {
        const platforms = gameData[i].platforms;
        for (p=0; p< platforms.length; p++) {
            const plat = platforms[p].toLowerCase();
            if (plat.includes('playstation')) {
                sony++;
            }
            if (plat.includes('xbox')) {
                microsoft++;
            }
            if (plat.includes('nintendo') || plat.includes('game boy') || plat.includes('gamecube') || plat.includes('wii')) {
                nintendo++;
            }
        }
    }

    const totalEl = document.querySelector('#game-total .total-num');
    totalEl.textContent = total;
    
    const sonyEl = document.querySelector('#sony-total .total-num');
    sonyEl.textContent = sony;

    const nintendoEl = document.querySelector('#nintendo-total .total-num');
    nintendoEl.textContent = nintendo;

    const microsoftEl = document.querySelector('#microsoft-total .total-num');
    microsoftEl.textContent = microsoft;
}


// Determine and chart unique platforms
getUniquePlatforms(gameData);

function getUniquePlatforms(data) {
    var platformArrs = [];
    for (i = 0; i < gameData.length; i++) {

        platformArrs.push(gameData[i].platforms);

        if (i === (gameData.length - 1)) {
            let merged = [].concat.apply([], platformArrs);
            var counts = {};

            for (var i = 0; i < merged.length; i++) {
                var num = merged[i];
                counts[num] = counts[num] ? counts[num] + 1 : 1;
            }

            const ordered = {};
            Object.keys(counts).sort().forEach(function(key) {
            ordered[key] = counts[key];
            });

            let sortable = [];
            for (let platform in counts) {
                sortable.push([platform, counts[platform]]);
            }

            sortable.sort(function(a, b) {
                return b[1] - a[1];
            });

            createPlatformChart(sortable);
        
        }
    }
}

function createPlatformChart(data){

     let platforms = [];
     let counts = [];

     for (i=0;i<10;i++) {
         platforms.push(data[i][0]);
         counts.push(data[i][1]);
     }

    const platformChartEl = document.getElementById('platforms-chart').getContext('2d');
    const platformChart = new Chart(platformChartEl, {
        type: 'doughnut',
        options: {
            responsive: true,
            legend: {
                position: 'bottom',
                labels: {
                    fontColor: "white",
                    boxWidth: 20,
                    padding: 20
                }
            }
        },
        data: {
            labels: platforms,
            datasets: [{
                label: 'Platforms',
                data: counts,
                backgroundColor: [
                    'rgba(126, 212, 135, 1.0)',
                    'rgba(54, 162, 235, 1.0)',
                    'rgba(232, 72, 85, 1.0)',
                    'rgba(255, 206, 86, 1.0)',
                    'rgba(75, 192, 192, 1.0)',
                    'rgba(153, 102, 255, 1.0)',
                    'rgba(255, 159, 64, 1.0)',   
                    'rgba(112, 235, 238, 1.0)',
                    'rgba(238, 112, 235, 1.0)',
                    'rgba(255, 99, 132, 1.0)',
                    
                ],
                borderColor: [
                    'rgba(7, 5, 58, 1)',
                    'rgba(7, 5, 58, 1)',
                    'rgba(7, 5, 58, 1)',
                    'rgba(7, 5, 58, 1)',
                    'rgba(7, 5, 58, 1)',
                    'rgba(7, 5, 58, 1)',
                    'rgba(7, 5, 58, 1)',
                    'rgba(7, 5, 58, 1)',
                    'rgba(7, 5, 58, 1)',
                    'rgba(7, 5, 58, 1)',
                ],
                borderWidth: 6
            }]
        }
    });
}
