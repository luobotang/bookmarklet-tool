var app = app || {}

app.util = app.util || {}
app.util.escapeHtml = (function () {

  // escape-html v1.0.3 from NPM

  var matchHtmlRegExp = /["'&<>]/;

  return function escapeHtml(string) {
    var str = '' + string;
    var match = matchHtmlRegExp.exec(str);

    if (!match) {
      return str;
    }

    var escape;
    var html = '';
    var index = 0;
    var lastIndex = 0;

    for (index = match.index; index < str.length; index++) {
      switch (str.charCodeAt(index)) {
        case 34: // "
          escape = '&quot;';
          break;
        case 38: // &
          escape = '&amp;';
          break;
        case 39: // '
          escape = '&#39;';
          break;
        case 60: // <
          escape = '&lt;';
          break;
        case 62: // >
          escape = '&gt;';
          break;
        default:
          continue;
      }

      if (lastIndex !== index) {
        html += str.substring(lastIndex, index);
      }

      lastIndex = index + 1;
      html += escape;
    }

    return lastIndex !== index
      ? html + str.substring(lastIndex, index)
      : html;
  }
})()

app.init = (function () {
  var escapeHtml = app.util.escapeHtml

  var $code
  var $btn
  var $output

  function init() {
    $code = document.getElementById('code')
    $btn = document.getElementById('generate')
    $output = document.getElementById('output')

    $btn.addEventListener('click', function () {
      makeCodeHref($code.value)
        .then(escapeHtml)
        .then(makeResultElement)
        .then(appendResultToOutputBox)
        .catch((e) => {
          alert(`Failed to transform the code. ${e && e.message}`)
        })
    })

    $output.addEventListener('click', function (e) {
      if (e.target.matches('.close')) {
        var item = e.target.parentElement.parentElement
        if (item.matches('.result-item')) {
          item.parentElement.removeChild(item)
        }
      }
    })
  }

  function makeCodeHref(code) {
    return fetch('/transform', {
      method: 'POST',
      body: code
    }).then(res => {
      if (res.status >= 200 && res.status < 300) {
        return res.text()
      } else {
        return res.text().then(text => {
          throw new Error('Transform Failed: ' + text)
        })
      }
    })
  }

  function makeResultElement(codeHref) {
    var $result = document.createElement('div')
    $result.className = 'result-item'
    $result.innerHTML = (
      '<p><a href="' + codeHref + '">run</a><a class="close">×</a></p>' +
      '<pre><code>' + codeHref + '</code></pre>'
    )
    return $result
  }

  function appendResultToOutputBox($result) {
    var $firstChild = $output.children && $output.children[0]
    if ($firstChild) {
      $output.insertBefore($result, $firstChild)
    } else {
      $output.appendChild($result)
    }
  }

  return init
})()


window.onload = function () {
  app.init()
}