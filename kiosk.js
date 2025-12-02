
$(document).ready(function() {
    // 메뉴 항목이 동적으로 추가되었을 때에도 dragstart 이벤트 처리
    $("#menu-box").on("dragstart", ".menu-item", function(event) {
        let name = $(this).data("name");
        let price = $(this).data("price");
        let imgsrc = $(this).find("img").attr("src");
        event.originalEvent.dataTransfer.setData("text", JSON.stringify({ name, price, imgsrc }));
    });

    // 메뉴 아이템을 드래그 가능하도록 설정
    $(".menu-item").on("dragstart", function(event) {
        let name = $(this).data("name");
        let price = $(this).data("price");
        let imgsrc = $(this).find("img").attr("src");
        event.originalEvent.dataTransfer.setData("text", JSON.stringify({ name, price, imgsrc }));
    });

    // 장바구니 아이템을 드래그 가능하도록 설정
    $("#cart-items").on("dragstart", ".cart-item", function(event) {
        let name = $(this).data("name");
        let price = $(this).data("price");
        let imgsrc = $(this).find("img").attr("src");
        event.originalEvent.dataTransfer.setData("text", JSON.stringify({ name, price, imgsrc }));
    });

    // 장바구니 박스에서 드랍 이벤트 처리
    $("#cart-box").on("dragover", function(event) {
        event.preventDefault(); 
    });

    $("#cart-box").on("drop", function(event) {
        event.preventDefault();

        let data = event.originalEvent.dataTransfer.getData("text");
        let menu = JSON.parse(data);
        
        let isDuplicate = $("#cart-items .cart-item").filter(function() {
            return $(this).data("name") === menu.name;
        }).length > 0;
        
        
        if (!isDuplicate) {
            addItemToCart(menu.name, menu.price, menu.imgsrc);
            $(".menu-box .menu-item").filter(function() {
                return $(this).data("name") === menu.name;
            }).hide();
        }else{
            if($("#cart-items .cart-item").filter(function() {
                return $(this).data("name") === menu.name;
            }).is(":hidden")){
                $("#cart-items .cart-item").filter(function() {
                    return $(this).data("name") === menu.name;
                }).show();
            }
            $(".menu-box .menu-item").filter(function() {
                return $(this).data("name") === menu.name;
            }).hide();
            updateCartTotalPrice();
        }
    });

    // 메뉴 박스에서 드랍 이벤트 처리
    $("#menu-box").on("dragover", function(event) {
        event.preventDefault();
    });

    $("#menu-box").on("drop", function(event) {
        event.preventDefault();

        let data = event.originalEvent.dataTransfer.getData("text");
        let menu = JSON.parse(data);

        $(".menu-box .menu-item").filter(function() {
            return $(this).data("name") === menu.name;
        }).show();
        $("#cart-items .cart-item").filter(function() {
            return $(this).data("name") === menu.name;
        }).hide();


        updateCartTotalPrice();
    });

    function updateCartTotalPrice() {
        let totalPrice = 0;

        // 현재 보이는 장바구니 항목의 총 가격 계산
        $("#cart-items .cart-item").each(function () {
            if ($(this).css("display") !== "none") {
                let itemCount = parseInt($(this).find(".item-count").text());
                let itemPrice = parseInt($(this).data("price"));
                totalPrice += itemCount * itemPrice;
            }
        });

        // 총 가격 업데이트
        $(".cart-total-price").text(`총가격: ${totalPrice}원`);
    }

    // 장바구니에 아이템 추가 함수
    function addItemToCart(name, price, imgsrc) {
        let itemHtml = `
            <div class="cart-item" draggable="true" data-name="${name}" data-price="${price}">
                <img src="${imgsrc}" alt="${name}" class="menu-image">
                <div class="cart-item-info">
                    <p>${name}</p>
                    <p>가격: (${price}원)</p>
                </div>
                <div class="quantity-container">
                    <button class="rembtn">-</button>
                    <p class="item-count">1</p>
                    <button class="addbtn">+</button>
                    </div>
                    <p class="cart-item-totalprice">${price}원</p>
            </div>`;

        $("#cart-items").append(itemHtml);
        updateCartTotalPrice();
    }

    // 장바구니 아이템 갯수 삽입 함수
    $(document).on("click", ".addbtn", function () {
        let countElem = $(this).siblings(".item-count");
        let totalPriceElem = $(this).closest(".cart-item").find(".cart-item-totalprice"); // 소계 요소 선택
        let price = parseInt($(this).closest(".cart-item").data("price")); // 항목 가격 가져오기

        let count = parseInt(countElem.text());
        count++;
        countElem.text(count);

        // 소계 업데이트
        totalPriceElem.text(`${price * count}원`);
        updateCartTotalPrice();
    });

    $(document).on("click", ".rembtn", function () {
        let countElem = $(this).siblings(".item-count");
        let totalPriceElem = $(this).closest(".cart-item").find(".cart-item-totalprice"); // 소계 요소 선택
        let price = parseInt($(this).closest(".cart-item").data("price")); // 항목 가격 가져오기

        let count = parseInt(countElem.text());
        if (count <= 1) {
            count = 1;
        } else {
            count--;
        }
        countElem.text(count);

        // 소계 업데이트
        totalPriceElem.text(`${price * count}원`);
        updateCartTotalPrice();
    });


    
    // 메뉴 박스에 아이템 추가 함수
    function addItemToMenuBox(name, price, imgsrc) {
        let menuItemHtml = `
            <div class="menu-item" draggable="true" data-name="${name}" data-price="${price}">
                <img src="${imgsrc}" alt="${name}" class="menu-image">
                <p>${name}</p>
                <p>가격: ${price}원</p>
            </div>`;
        
        $("#menu-box").append(menuItemHtml);
        updateCartTotalPrice();
    }

    // 결제 버튼 클릭 시 영수증 페이지 출력
    $("#pay-btn").on("click", function() {
        let cartItems = $("#cart-items .cart-item");
        let totalPrice = 0;
        let receiptHtml = "";
        let menuList = [];

        cartItems.each(function() {
            if($(this).css("display") === "none"){
                return;
            } // 추가했다 삭제된 메뉴를 hide로 해서 영수증에 출력되길래 이벤트 처리함

            let name = $(this).data("name");
            let quantity = parseInt($(this).find(".item-count").text());
            let price = parseInt($(this).data("price"));

            menuList.push({
                name: name,
                quantity: quantity
            });

            //영수증에 출력될 메뉴 별 메세지
            receiptHtml += `
                <div class="receipt-item">
                    <p>${name} [${quantity}개] : ${price * quantity}원</p>
                </div>
            `;
            totalPrice += price * quantity;
            
        });

        
        // 판매내역의 테이블로 삽입될 코드
        let now = new Date();
        let time = now.toISOString().slice(0, 19).replace("T", " ");

        let tableBody = function(){
            let tableHtmls = "";
            for(let item of menuList){
                let tableHtml = `
                    <tr>
                        <td>${item.name}</td>
                        <td>${item.quantity}</td>
                    </tr>
                `;
                tableHtmls += tableHtml;
            }
            return tableHtmls;
        }


        let tableHtml = `
            <table class="sale-table">
                    <tr>
                        <th colspan="2">${time}</th>
                    </tr>
                    <tr>
                        <th>메뉴명</th>
                        <th>수량</th>
                    </tr>
                    ${tableBody()}
                    <tr>
                        <td colspan="2">총액: ${totalPrice}원</td>
                    </tr>
            </table>
            <br>
        `;

        $("#sale-history-container").append(tableHtml);

        $("#receipt-items").html(receiptHtml);
        $("#total-price").html(`<h3>총 금액: ${totalPrice}원</h3>`);
        $("#receipt-container").show();
    });

    // 영수증 닫기 버튼 클릭 시 초기화
    $("#close-receipt").on("click", function() {
        $("#menu-box .menu-item").each(function() {
            if ($(this).css("display") === "none") {
                $(this).show();  // 숨겨진 menu-item을 다시 보이게 함
            }
        });
        // 장바구니 초기화
        $("#cart-items").empty();
        $("#receipt-container").hide();
        $(".menu-item").each(function() {
            $(this).attr("draggable", true);  // 드래그 가능 상태로 되돌림
            
        });
    });
    

    // 관리자 모드 버튼 클릭 시 메뉴 박스 이동
    $(".admin-button").on("click", function() {
        let pswd = prompt("비밀번호를 입력하시오.");
        if (pswd !== "5374") {
            alert("비밀번호가 맞지 않습니다.");
            return;
        }
        $("#admin-container").show();
    });
    $("#close-admin").on("click", function() {
        $("#admin-container").hide();
    });

    //관리자 모드에서 메뉴 수정 버튼 클릭 시 메뉴수정 페이지 이동
    $("#menu-edit-button").on("click", function() {
        $("#admin-container").hide();
        $("#menu-edit-container").show();
    });
    $("#close-menu-edit").on("click", function() {
        $("#menu-edit-container").hide();
    });

    //메뉴수정에서 추가를 눌렀을 때
    $(".menu-add-btn").on("click", function(event){
        event.preventDefault();
        event.stopPropagation();
        let menuName = $("#edit-menu-name").val();
        let menuPrice = $("#edit-menu-price").val();
        let menuPicture = $("#edit-menu-picture").val();
        if(menuName&&menuPrice&&menuPicture){
            let existingMenu = $("#menu-box").find(".menu-item").filter(function() {
                return $(this).find("p").first().text() === menuName;  // 메뉴 이름이 일치하는지 확인
            });
        
            // 중복 메뉴가 없으면 추가, 있으면 알림 표시
            if (existingMenu.length > 0) {
                alert("이미 존재하는 메뉴입니다.");
            } else {
                let menuItemHtml = `
                    <div class="menu-item" draggable="true" data-name="${menuName}" data-price="${menuPrice}">
                        <img src="${menuPicture}" alt="${menuName}" class="menu-image">
                        <p>${menuName}</p>
                        <p>가격: ${menuPrice}원</p>
                    </div>
                `;
                $(".menu-items").append(menuItemHtml);
            }
            $("#menu-edit-container").hide();
        }else{
            alert("빈 정보를 채워주세요.")
        }
        $("#edit-menu-name").val("");
        $("#edit-menu-price").val("");
        $("#edit-menu-picture").val("");
    });

    //메뉴수정에서 삭제을 눌렀을 때
    $(".menu-rem-btn").on("click", function(event){
        event.preventDefault();
        event.stopPropagation();
        let menuName = $("#edit-menu-name").val();
        if(menuName){
            $(".menu-item[data-name='" + menuName + "']").remove();
            $("#menu-edit-container").hide();
            $("#edit-menu-name").val("");
            $("#edit-menu-price").val("");
            $("#edit-menu-picture").val("");
        }else{
            alert("삭제할 메뉴명을 적어주세요.")
        }
    });

    //관리자모드에서 판매내역 눌렀을 때 판매내역 페이지 이동
    $("#sale-place-button").on("click", function() {
        $("#admin-container").hide();
        $(".sale-place-container").show();
    });
    $("#close-sale").on("click", function() {
        $(".sale-place-container").hide();
    });

    //판매내역에서 초기화 눌렀을 때 테이블 삭제
    $("#delete-table").on("click", function() {
        $("#sale-history-container").empty();
    });
});
