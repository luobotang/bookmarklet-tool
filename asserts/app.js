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

/*
 * Use UglifyJS to 'uglify' the code
 * docs:
 * - http://lisperator.net/uglifyjs/
 * - http://lisperator.net/uglifyjs/compress
 */
app.util.uglifyCode = function (code) {
  var ast = UglifyJS.parse(code)
  ast.figure_out_scope()
  ast.compute_char_frequency()
  ast.mangle_names()
  compressor = UglifyJS.Compressor()
  ast = ast.transform(compressor)
  return ast.print_to_string()
}

app.util.beforeParse = function (code) {
  // support ES6 function expression like this (in one line, only one statement):
  // (var1, ...) => { ... }
  // replace to:
  // function (var1, ...) { ... }
  return code.replace(/\(([^()]+)\)\s*=>\s*\{([^}]+)\}/g, 'function ($1) {$2}')
}

app.util.afterParse = function (code) {
  if (code[code.length - 1] === ';') {
    return code.substr(0, code.length - 1)
  } else {
    return code
  }
}

app.init = (function () {
  var escapeHtml = app.util.escapeHtml
  var beforeParse = app.util.beforeParse
  var uglifyCode = app.util.uglifyCode
  var afterParse = app.util.afterParse

  var $code
  var $btn
  var $output

  function init() {
    $code = document.getElementById('code')
    $btn = document.getElementById('generate')
    $output = document.getElementById('output')

    $btn.onclick = function () {
      var code = $code.value
      var codeHref = makeCodeHref(code)
      var $result = makeResultElement(codeHref)
      appendResultToOutputBox($result)
    }
  }

  function makeCodeHref(code) {
    code = beforeParse(code)
    code = uglifyCode('void(function(){' + code + '}())')
    code = afterParse(code)
    return 'javascript:' + escapeHtml(code)
  }

  function makeResultElement(codeHref) {
    var $result = document.createElement('div')
    $result.className = 'result-item'
    $result.innerHTML = (
      '<p><a href="' + codeHref + '">Bookmarklet</a></p>' +
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