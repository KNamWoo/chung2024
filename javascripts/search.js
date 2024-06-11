var markers = [];
let presentPosition;

var Container = document.getElementById('map');

var mapOptions = {
    center: new naver.maps.LatLng(37.3595704, 127.105399),//페이지로 들어왔을때 기준을 청운대 인천캠퍼스로 잡음
    zoom: 10,//지도의 확대 정도
    mapTypeControl: true
};

var map = new naver.maps.Map(Container, mapOptions);//지도 생성

var locPosition = new naver.maps.LatLng(37.4720, 126.6608)//청운대 인천캠퍼스를 출발지로
presentPosition = locPosition;

map.setCenter(locPosition);//보낼 출발지를 청운대로 설정하기



//장소 검색
var ps = new kakao.maps.services.Places();//장소 검색 개체 생성

var infowindow = new kakao.maps.InfoWindow({zIndex:1});//검색 결과 목록이나 마커를 클릭하면 장소명 인포윈도우 생성

const searchForm = document.querySelector('.form');
searchForm.addEventListener('submit', function(e){
    e.preventDefault();
    searchPlaces();//키워드 검색 요청
})

function searchPlaces(){
    var keyword = document.getElementById('keyword').value;
    if(!keyword.replace(/^\s+|\s+$/g, '')){
        alert('키워드를 입력해주세요!');
        return false;
    }

    ps.keywordSearch(keyword, placeSearchCB);//장소검색 객체를 통해 키워드로 장소검색 요청
}

function placeSearchCB(data, status, pagination){
    if(status === kakao.maps.services.Status.OK){//장소검색 완료
        displayPlaces(data);//검색 목록과 마커 표출
        displayPagination(pagination);
    }else if(status === kakao.maps.services.Status.ZERO_RESULT){
        alert('검색 결과가 존재하지 않습니다.');
        return;
    }else if(status === kakao.maps.services.Status.ERROR){
        alert('검색 결과 중 오류가 발생했습니다.');
        return;
    }
}

function displayPlaces(places){
    var listEl = document.getElementById('placesList'),
    menuEl = document.getElementById('menu_wrap'),
    fragment = document.createDocumentFragment(),
    bounds = new kakao.maps.LatLngBounds(),
    listStr = '';

    removeAllChildNods(listEl);//이전 검색 결과 목록에 추가되었던 항목을 제거
    removeMarker();//이전 마커를 제거

    for(var i=0; i<places.length; i++){
        const lon = places[i].x;
        const lat = places[i].y;

        var placePosition = new kakao.maps.LatLng(places[i].y, places[i].x),
            marker = addMarker(placePosition, i),
            itemEl = getListItem(i, places[i]);//검색 결과 항목 Element를 생성
        
        bounds.extend(placePosition);//검색 장소 위치 기준 지도 범위 재설정을 위해 LatLngBounds 객체에 좌표 추가

        (function(marker, title){
            naver.maps.Event.addListener(marker, 'mouseover', function(){
                displayInfowindow(marker, title);
            });

            naver.maps.Event.addListener(marker, 'mouseout', function(){
                infowindow.close();
            });

            itemEl.onmouseover = function(){
                displayInfowindow(marker, title);
            };

            itemEl.onmouseout = function(){
                infowindow.close();
            };
        })(marker, places[i].place_name);

        (function(marker, title){
            naver.maps.Event.addListener(marker, 'click', function(){
                searchDetailAddrFromCoords(presentPosition, function(result, status){
                    if(status === kakao.maps.services.Status.OK){
                        detailAddr = !!result[0].road_address ? result[0].road_address.address_name : result[0].address.address_name;
                        location.href = "https://map.kakao.com/?sName="+detailAddr+"&eName="+title
                    }
                });
            })
            
            itemEl.onclick = function(){
                searchDetailAddrFromCoords(presentPosition, function(result, status){
                    if(status === kakao.maps.services.Status.OK){
                        detailAddr = !!result[0].road_address ? result[0].road_address.address_name : result[0].address.address_name;
                        location.href = "https://map.kakao.com/?sName="+detailAddr+"&eName="+title
                    }
                });
            };
        })(marker, places[i].place_name);

        fragment.appendChild(itemEl);
    }
    listEl.appendChild(fragment);//검색결과 항목을 결과 목록 Elemnet에 추가
    menuEl.scrollTop = 0;

    /*map.setBounds(bounds);//검색 장소 위치를 기준으로 지도 재설정*/
}

function getListItem(index, places){//검색결과 항목을 Element로 반환
    var el = document.createElement('li'),
    itemStr = '<span class = "markerbg marker_' + (index+1)+'"></span'+
                '<div class = "info">'+
                '   <h5>'+places.place_name+'</h5>';

    if (places.road_address_name) {
        itemStr += '    <span>' + places.road_address_name + '</span>' +
                    '   <span class="jibun gray">' +  places.address_name  + '</span>';
    } else {
        itemStr += '    <span>' +  places.address_name  + '</span>'; 
    }
                 
    itemStr += '  <span class="tel">' + places.phone  + '</span>' +
                '</div>';           
 
    el.innerHTML = itemStr;
    el.className = 'item';
 
    return el;
}






// 마커를 생성하고 지도 위에 마커를 표시하는 함수입니다
function addMarker(position, idx, title) {
    /*var imageSrc = 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_number_blue.png', // 마커 이미지 url, 스프라이트 이미지를 씁니다
        imageSize = new naver.maps.Size(36, 37),  // 마커 이미지의 크기
        imgOptions =  {
            spriteSize : new naver.maps.Size(36, 691), // 스프라이트 이미지의 크기
            spriteOrigin : new naver.maps.Point(0, (idx*46)+10), // 스프라이트 이미지 중 사용할 영역의 좌상단 좌표
            offset: new naver.maps.Point(13, 37) // 마커 좌표에 일치시킬 이미지 내에서의 좌표
        },
        //markerImage = new naver.maps.MarkerImage(imageSrc, imageSize, imgOptions),*/
    var marker = new naver.maps.Marker({
        position: position, // 마커의 위치
        //image: markerImage 
    });
 
    marker.setMap(map); // 지도 위에 마커를 표출합니다
    markers.push(marker);  // 배열에 생성된 마커를 추가합니다
 
    return marker;
}
 
// 지도 위에 표시되고 있는 마커를 모두 제거합니다
function removeMarker() {
    for ( var i = 0; i < markers.length; i++ ) {
        markers[i].setMap(null);
    }   
    markers = [];
}
 
// 검색결과 목록 하단에 페이지번호를 표시는 함수입니다
function displayPagination(pagination) {
    var paginationEl = document.getElementById('pagination'),
        fragment = document.createDocumentFragment(),
        i; 
 
    // 기존에 추가된 페이지번호를 삭제합니다
    while (paginationEl.hasChildNodes()) {
        paginationEl.removeChild (paginationEl.lastChild);
    }
 
    for (i=1; i<=pagination.last; i++) {
        var el = document.createElement('a');
        el.href = "#";
        el.innerHTML = i;
 
        if (i===pagination.current) {
            el.className = 'on';
        } else {
            el.onclick = (function(i) {
                return function() {
                    pagination.gotoPage(i);
                }
            })(i);
        }
 
        fragment.appendChild(el);
    }
    paginationEl.appendChild(fragment);
}
 
// 검색결과 목록 또는 마커를 클릭했을 때 호출되는 함수입니다
// 인포윈도우에 장소명을 표시합니다
function displayInfowindow(marker, title) {
    var content = '<div style="padding:5px;z-index:1;">' + title + '</div>';
 
    infowindow.setContent(content);
    infowindow.open(map, marker);
}
 
 // 검색결과 목록의 자식 Element를 제거하는 함수입니다
function removeAllChildNods(el) {   
    while (el.hasChildNodes()) {
        el.removeChild (el.lastChild);
    }
}
 
// 좌표 -> 주소
var geocoder = new kakao.maps.services.Geocoder();
function searchDetailAddrFromCoords(coords, callback) {
    geocoder.coord2Address(coords.getLng(), coords.getLat(), callback);
}