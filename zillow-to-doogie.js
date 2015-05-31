(function () {

  function factListItems () {
    return $('.fact-group-container.zsg-content-component h4')
      .filter(function () {
        return $(this).text().trim().toLowerCase() === 'facts';
      })
      .next('ul')
      .find('li');
  }

  var fields = [
    {
      field: '__name',
      selector: '.zsg-content-header.addr h1'
    },{
      field: 'Cost',
      selector: '.main-row.home-summary-row'
    },{
      field: 'Zestimate',
      selector: '.home-summary-row .zsg-tooltip-launch + span'
    },{
      field: 'Rooms',
      selector: function () {
        return $('.zsg-content-header.addr h3 .addr_bbs')
          .not(':last')
          .map(function () { return $(this).text(); })
          .get()
          .join(', ');
      }
    },{
      field: 'Visit',
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
      field: 'Taxes',
      selector: '#hdp-tax-history tr:first .numeric:first',
      alter: function (content) {
        var getRidOf = $('#hdp-tax-history tr:first .numeric:first .delta-value').text();
        return content.replace(getRidOf, '');
      }
    },{
      field: 'Year Built',
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
      field: 'A/C',
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
      field: 'Heating',
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
      field: 'Zillow Link',
      selector: function () {
        return window.location.href;
      }
    }
  ];

  var contents = $.map(fields, function (index, field) {
    var content = (typeof field.selector === 'function' ? field.selector() : $(field.selector).text()).trim();
    if (!content) return null;

    if (field.alter) {
      content = field.alter(content);
    }
    return {
      field: field.field,
      content: content
    };
  });

  contents = $.filter(contents, function (index, content) {
    return content !== null;
  });

  console.log(contents);

}());
