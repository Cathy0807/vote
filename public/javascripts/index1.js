window.onload = function () {
    var regIndex = /index/;
    var regSearch = /search/;
    var regRegister = /register/;
    var regDetail = /detail\/(\d+)/;
    var url = window.location.href;
    var flag = true;
    var limit = 10;
    var offset = limit;
    var timer = null;
    var total = null;
    var util = {
        indexStr: function (data) {
            var str = '';
            var len = null;
            var persons = null;
            try {
                len = data.objects.length;
                persons = data.objects
            } catch (e) {
                len = data.length;
                persons = data;
            }
            for (var i = 0; i < len; i++) {
                var person = persons[i];
                str += '<li class="one">'
                    + '<a href="/vote/detail/' + person.id + '">'
                    + ' <div class="headerImg">'
                    + ' <img src="' + person.head_icon + '" alt=""></div>'
                    + ' <div class="message">'
                    + '<span class="name">' + person.username + '</span><span class="card">编号#' + person.id + '</span>'
                    + ' <p class="t">' + person.description + '</p> </div></a>'
                    + '<div class="s">'
                    + '<div class="num">' + person.vote + '票</div>'
                    + '<div class="btn" btnId="' + person.id + '">投TA一票</div></div></li>'
            }
            return str;
        },
        btnFn: function () {
            $('.btn').click(function (e) {
                    if (window.localStorage.user) {
                        var voterId = JSON.parse(window.localStorage.user).id;
                        var that = $(this);
                        var id = that.attr('btnId');
                        $.ajax({
                            url: '/vote/index/poll?id=' + id + '&voterId=' + voterId,
                            type: 'GET',
                            dataType: 'json',
                            success: function (data) {
                                if (data.errno == 0) {
                                    var num = parseInt(that.prev().html()) + 1;
                                    that.prev().addClass('trans').html(num + '票');
                                } else if (data.errno == -1) {
                                    alert(data.msg)
                                } else if (data.errno == -2) {
                                    alert(data.msg)
                                }
                            }
                        })
                    } else {
                        document.body.scrollTop = 0;
                        $('.login').css('display', 'block')
                    }
            });
        },
        detailStr: function (data) {
            var person = data.data;
            var str2 = '';
            var str1 = '<div class="title_de"> <img src="' + person.head_icon + '" alt=""></div>'
                + '<div class="self">'
                + '<p>' + person.username + '</p>'
                + '<p>编号#' + person.id + '</p></div>'
                + '<div class="mes">'
                + '<h2>' + person.rank + '名</h2>'
                + '<p>' + person.vote + '票</p></div>'
                + '<div class="declaration">' + person.description + '</div>';

            var vfriend = person.vfriend;
            for (var i = 0; i < vfriend.length; i++) {
                var friend = vfriend[i];
                str2 += '<li class="one_de">'
                    + '<div class="headerImg">'
                    + ' <img src="' + friend.head_icon + '" alt=""></div>'
                    + '<div class="message">'
                    + '<p>' + friend.username + '</p>'
                    + '<p class="t">编号#' + friend.id + '</p> </div>'
                    + '<div class="num_de">投了一票</div></li>'
            }
            $('.person').html(str1);
            $('.persons_de').html(str2);
        }
    };
    if (regIndex.test(url)) {
        $.ajax({
            url: '/vote/index/data?limit=' + limit + '&offset=0',
            type: 'GET',
            dataType: 'json',
            success: function (data) {
                total = data.data.total;
                $('.persons').html(util.indexStr(data.data));
                util.btnFn();
            }
        });
        window.onscroll = function (e) {
            e = e || window.event;
            if (document.body.scrollTop + document.documentElement.clientHeight + 100 > document.body.scrollHeight && flag) {
                if (total >= offset) {
                    flag = false;
                    $.ajax({
                        url: '/vote/index/data?limit=' + limit + '&offset=' + offset,
                        type: 'GET',
                        dataType: 'json',
                        success: function (data) {
                            total = data.data.total;
                            clearTimeout(timer);
                            timer = setTimeout(function () {
                                flag = true
                            }, 500);
                            $('.persons').append(util.indexStr(data.data));
                            offset = offset + limit;
                            util.btnFn();
                        }
                    });
                } else {
                    flag = false;
                    $('.persons').append('没有了~~~~！')
                }
            }
        };
        /*---搜索----*/
        $('#sBtn').click(function () {
            var searchData = $(this).prev().attr('value');
            window.location.href = '/vote/search?content=' + searchData;
        });
        /*----判断是否登录----*/
        if (localStorage.user) {
            var user = JSON.parse(window.localStorage.user);
            $('.sign').html('<a href = "#" class= "aLogin" > <span>退出登陆</span></a>');
            $('.go').html('<a href="/vote/detail/' + user.id + '" class="myself">个人主页</a>');
            $('.use').html(user.username);
            $('.aLogin').click(function (e) {
                $('.outIn').css('display', 'block');
            }, false);
            $('.outIn').click(function (e) {
                if ($(e.target).attr('class') == 'outIn') {
                    $('.outIn').css('display', 'none');
                } else if ($(e.target).attr('class') == 'out') {
                    localStorage.removeItem("user");
                    window.location.href = '/vote/index'
                }
            }, false);
        }
        else {
            $('.aLogin').click(function () {
                $('.login').css('display', 'block')
            });
            $('.login').click(function (e) {
                if ($(e.target).attr('class') == 'index_btn') {
                    var id = $('.loginId').attr('value');
                    var password = $('.loginPassword').attr('value');
                    $.ajax({
                        url: '/vote/index/info',
                        type: 'post',
                        dataType: 'json',
                        data: {
                            id: id,
                            password: password
                        },
                        success: function (data) {
                            if (data.errno == -1) {
                                alert(data.msg)
                            }
                            else if (data.errno == 0) {
                                window.localStorage.user = JSON.stringify({
                                    id: id,
                                    username: data.user.username
                                });
                                alert('登陆成功');
                                window.location.href = '/vote/index';
                            }
                        }
                    })
                }
                else if ($(e.target).attr('class') == 'login') {
                    $('.login').css('display', 'none');
                }
            });
        }

        /*-----投票----------*/

    }
    else if (regSearch.test(url)) {
        var reg = /content=([^=+?*;]+)/i;
        var dataContent = reg.exec(url)[1];
        $('.login').click(function (e) {
            if ($(e.target).attr('class') == 'index_btn') {
                var id = $('.loginId').attr('value');
                var password = $('.loginPassword').attr('value');
                $.ajax({
                    url: '/vote/index/info',
                    type: 'post',
                    dataType: 'json',
                    data: {
                        id: id,
                        password: password
                    },
                    success: function (data) {
                        if (data.errno == -1) {
                            alert(data.msg)
                        }
                        else if (data.errno == 0) {
                            window.localStorage.user = JSON.stringify({
                                id: id,
                                username: data.user.username
                            });
                            alert('登陆成功');
                            window.location.href = '/vote/search?content=' + dataContent;
                        }
                    }
                })
            }
            else if ($(e.target).attr('class') == 'login') {
                $('.login').css('display', 'none');
            }
        });
        $.ajax({
            url: '/vote/index/search?content=' + dataContent,
            method: 'GET',
            dataType: 'json',
            success: function (data) {
                $('.persons').html(util.indexStr(data.data));
                util.btnFn();
            }
        })
    }
    else if (regDetail.test(url)) {
        var id = regDetail.exec(url)[1];
        $.ajax({
            url: '/vote/all/detail/data?id=' + id,
            type: 'GET',
            dataType: 'json',
            success: function (data) {
                if (data.errno == 0) {
                    util.detailStr(data);
                }
            }
        })
    }
    else if (regRegister.test(url)) {
        $('.btn').click(function () {
            var password = $('.password').attr('value');
            var rePassword = $('.rePassword').attr('value');
            var username = $('.username').attr('value');
            var mobile = $('.phone').attr('value');
            var description = $('.direction').attr('value');
            var boy = $('#boy').attr('checked');
            if (!/^[^\d]/.test(username)) {
                alert('用户名不能以数字开头');
                return false
            }
            if (!mobile) {
                alert('手机号不能为空');
                return false
            }
            if (password !== rePassword) {
                alert('密码不相同');
                return false
            }
            $.ajax({
                url: '/vote/register/data',
                type: 'post',
                dataType: 'json',
                data:{
                    username:username,
                    password:password,
                    mobile:mobile,
                    description:description,
                    gender: boy ? 'boy' : 'girl'
                },
                success: function (data) {
                    if (data.errno == 0) {
                        alert(data.msg);
                        localStorage.user = JSON.stringify({
                            id: data.id,
                            username: username
                        });
                        window.location.href = '/vote/index';
                    }
                }
            })
        });
    }
};
