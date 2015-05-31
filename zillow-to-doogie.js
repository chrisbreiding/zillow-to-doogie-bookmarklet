(function () {

  var JQUERY_SCRIPT_URL = 'https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js';
  var FIREBASE_SCRIPT_URL = 'https://cdn.firebase.com/js/client/2.2.5/firebase.js';
  var authToken = window.__firebaseToken;
  var appName = window.__firebaseAppName;
  var firebaseUrl = 'https://' + appName + '.firebaseio.com/';

  function loadScript (url, cb) {
    var script = document.createElement('script');
    document.body.appendChild(script);
    script.onload = cb;
    script.src = url;
  }

  function factListItems () {
    return $('.fact-group-container.zsg-content-component h4')
      .filter(function () {
        return $(this).text().trim().toLowerCase() === 'facts';
      })
      .next('ul')
      .find('li');
  }

  function removeDollarSign (price) {
    return price.replace('$', '');
  }

  var fields = [
    {
      fieldKey: '__name',
      selector: '.zsg-content-header.addr h1'
    },{
      field: 'costField',
      selector: '.main-row.home-summary-row',
      alter: function (content) { return removeDollarSign(content); }
    },{
      field: 'zestimateField',
      selector: '.home-summary-row .zsg-tooltip-launch + span',
      alter: function (content) { return removeDollarSign(content); }
    },{
      field: 'roomsField',
      selector: function () {
        return $('.zsg-content-header.addr h3 .addr_bbs')
          .not(':last')
          .map(function () { return $(this).text(); })
          .get()
          .join(', ');
      }
    },{
      field: 'visitField',
      selector: function () {
        return $('.fact-group-container.zsg-content-component h4')
          .filter(function () {
            return $(this).text().trim().toLowerCase() === 'open house';
          })
          .next('ul')
          .find('li')
          .text();
      },
      alter: function (content) {
        return 'Open ' + content;
      }
    },{
      field: 'taxesField',
      selector: '#hdp-tax-history tbody tr:first .numeric:first',
      alter: function (content) {
        var getRidOf = $('#hdp-tax-history tbody tr:first .numeric:first .delta-value').text();
        return removeDollarSign(content.replace(getRidOf, ''));
      }
    },{
      field: 'yearBuiltField',
      selector: function () {
        return factListItems()
          .filter(function () {
            return /built in/i.test($(this).text());
          })
          .text();
      },
      alter: function (content) {
        return content.replace(/built in /i, '');
      }
    },{
      field: 'aCField',
      selector: function () {
        return factListItems()
          .filter(function () {
            return /cooling/i.test($(this).text());
          })
          .text();
      },
      alter: function (content) {
        return content.replace(/cooling: /i, '');
      }
    },{
      field: 'heatingField',
      selector: function () {
        return factListItems()
          .filter(function () {
            return /heating/i.test($(this).text());
          })
          .text();
      },
      alter: function (content) {
        return content.replace(/heating: /i, '');
      }
    },{
      field: 'zillowLinkField',
      selector: function () {
        return window.location.href;
      }
    }
  ];

  function getFieldContents () {
    return $.map(fields, function (field) {
      var content = (typeof field.selector === 'function' ? field.selector() : $(field.selector).text()).trim();
      if (!content) return null;

      if (field.alter) {
        content = field.alter(content);
      }
      return {
        fieldKey: field.fieldKey,
        field: field.field,
        content: content
      };
    }).filter(function (content) {
      return content !== null;
    });
  }

  function status (content) {
    var $shadow = $('#zd-shadow');
    if ($shadow.length) {
      $shadow.find('#zd-shadow-content').text(content);
    } else {
      var config = {
        id: 'zd-shadow',
        style: [
          'background: rgba(0,0,0,0.8)',
          'bottom: 0',
          'position: fixed',
          'left: 0',
          'top: 0',
          'right: 0',
          'z-index: 9999999'
        ].join(';')
      };
      var contentConfig = {
        id: 'zd-shadow-content',
        style: [
          'color: white',
          'font-size: 20px',
          'padding-top: 50px',
          'text-align: center'
        ].join(';')
      };
      $('<div />', config)
        .append($('<div />', contentConfig))
        .appendTo(document.body);
    }
  }

  function clearStatus () {
    $('#zd-shadow').remove();
  }

  function sendData (ref) {
    var contents = getFieldContents();

    ref.child('settings').on('value', function (snapshot) {
      var settings = snapshot.val();

      var value = {};
      $.each(contents, function (index, content) {
        var field = content.fieldKey || settings[content.field];
        if (!field) debugger;
        value[field] = content.content;
      });
      ref.child('houses').push(value, clearStatus);
    });
  }

  loadScript(JQUERY_SCRIPT_URL, function () {
    status('Loading...');

    loadScript(FIREBASE_SCRIPT_URL, function () {
      status('Authenticating...');

      var ref = new Firebase(firebaseUrl);
      ref.authWithCustomToken(authToken, function(error, authData) {
        if (error) {
          status('Login Failed! ' + error);
        } else {
          status('Fetching data...');
          sendData(ref);
        }
      });
    });
  });
}());
