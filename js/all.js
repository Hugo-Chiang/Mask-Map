// 變數宣告
const sideBar = document.querySelector('#sideBar');
const collapseButton = document.querySelector('#collapseButton');
const countySelection = document.querySelector('#countySelection');
const districtSelection = document.querySelector('#districtSelection');
const sortButton = document.querySelectorAll('.sortButton');
let resArr = [];
let selectedSuppliersArr = [];

// 監聽事件
collapseButton.addEventListener('click', collapseSideBar);
countySelection.addEventListener('change', renderDistrictSelection);
countySelection.addEventListener('change', selectedCounty);
districtSelection.addEventListener('change', selectedDistrict);
sortButton.forEach(button => button.addEventListener('click', switchSortButton));

// Leaflet初始佈局
let backgroudMap = L.map('backgroudMap').setView([25.0238087, 121.5531104], 20);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
}).addTo(backgroudMap);

//Leaflet地圖群組插件（透過新圖層）
let markers = new L.MarkerClusterGroup().addTo(backgroudMap);

// XMLHttpRequest初始佈局
let xhr = new XMLHttpRequest();
xhr.open('get', 'https://raw.githubusercontent.com/kiang/pharmacies/master/json/points.json');
xhr.send();

// xhr讀取回應檔案後的行為
xhr.onload = function () {
    resArr = JSON.parse(xhr.responseText).features;
    console.log(resArr);

    for (let i = 0; i < resArr.length; i++) {
        markers.addLayer(L.marker([resArr[i].geometry.coordinates[1], resArr[i].geometry.coordinates[0]]).bindPopup(`<h2>${resArr[i].properties.name}</h2>`));
        // if () {
        //     makers.addLayer()
        // } else {

        // }
    }
    backgroudMap.addLayer(markers);

    // 頁面其餘部分初始佈局
    renderCountySelection();
    renderDistrictSelection();

}

// 函式：側邊攔伸縮
function collapseSideBar() {
    let direction = document.querySelector('#direction');

    sideBar.classList.toggle('-show');
    direction.classList.toggle('-reverse');
}

// 函式：渲染縣市下拉選單
function renderCountySelection() {
    for (let i = 0; i < resArr.length; i++) {
        let county = resArr[i].properties.county;

        if (countySelection.textContent.search(county) == -1) {
            countySelection.innerHTML += `
        <option value="${county}" class="countyOption">${county}</option>`
        }
    }
}

// 函式：渲染行政區下拉選單
function renderDistrictSelection() {
    let selectedCounty = countySelection.value;
    districtSelection.innerHTML = `
    <option value="default">--請選擇行政區--</option>`;

    for (let i = 0; i < resArr.length; i++) {
        let county = resArr[i].properties.county;
        let town = resArr[i].properties.town;

        if (county == selectedCounty && districtSelection.textContent.search(town) == -1) {
            districtSelection.innerHTML += `
            <option value="${town}">${town}</option>`;
        }
    }
}

// 函式：已選擇縣市
function selectedCounty() {
    filterList.innerHTML = '';
}

// 函式：已選擇行政區
function selectedDistrict() {
    filterList.innerHTML = '';

    let selectedDistrict = districtSelection.value;

    selectedSuppliersArr = [];

    for (let i = 0; i < resArr.length; i++) {
        let town = resArr[i].properties.town;

        if (selectedDistrict == town) {
            let selectedSupplier = {
                supplierName: resArr[i].properties.name,
                supplierAddress: resArr[i].properties.address,
                supplierPhone: resArr[i].properties.phone,
                maskAdult: resArr[i].properties.mask_adult,
                maskChild: resArr[i].properties.mask_child
            };

            selectedSuppliersArr.push(selectedSupplier);
        }
    }

    sortFilterList('不指定', selectedSuppliersArr);
}

// 函式：切換排序按鈕
function switchSortButton(e) {
    e.preventDefault();

    sortButton.forEach((sortButton) => sortButton.classList.remove('selected'));
    e.target.classList.add('selected');

    sortFilterList(e.target.value, selectedSuppliersArr);
}


// 函式：更新清單排序
function sortFilterList(sortBasis, suppliersArr) {
    filterList.innerHTML = '';
    let arrCopy = suppliersArr.slice();

    switch (sortBasis) {
        case '不指定':
            console.log('不指定');
            arrCopy = suppliersArr;
            break;
        case '成人口罩':
            console.log('成人口罩');
            arrCopy.sort(function (a, b) {
                return b.maskAdult - a.maskAdult;
            });
            console.log(selectedSuppliersArr);
            break;
        case '兒童口罩':
            console.log('兒童口罩');
            arrCopy.sort(function (a, b) {
                return b.maskChild - a.maskChild;
            });
            console.log(selectedSuppliersArr);
            break;
        default:
            break;
    }

    let str = '';

    for (let i = 0; i < arrCopy.length; i++) {
        str += `
            <li class="supplier">
                <h3 class="supplierName">${arrCopy[i].supplierName}</h3>
                <div class="supplierAddress">${arrCopy[i].supplierAddress}</div>
                <div class="supplierPhone">${arrCopy[i].supplierPhone}</div>
                <div>成人口罩${arrCopy[i].maskAdult}個</div>
                <div>兒童口罩${arrCopy[i].maskChild}個</div>
            </li>`;
    }
    filterList.innerHTML = str;
}

// 函式：點擊Google導航