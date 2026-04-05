/* ML3X — Matrix Calculator */

var currentOp = 'add';
var history = [];

// ===== Operation Selector =====
(function initOps() {
  var btns = document.querySelectorAll('.op-btn');
  btns.forEach(function(b) {
    b.addEventListener('click', function() {
      btns.forEach(function(x) { x.classList.remove('active'); });
      b.classList.add('active');
      currentOp = b.dataset.op;
      updatePanelVisibility();
    });
  });
})();

function updatePanelVisibility() {
  var needsB = (currentOp === 'add' || currentOp === 'subtract' || currentOp === 'multiply');
  document.getElementById('panel-b').style.display = needsB ? '' : 'none';
}

// ===== Matrix Grid Builder =====
function rebuildMatrices() {
  buildGrid('a', getVal('rows-a'), getVal('cols-a'));
  buildGrid('b', getVal('rows-b'), getVal('cols-b'));
}

function buildGrid(id, rows, cols) {
  var grid = document.getElementById('grid-' + id);
  grid.innerHTML = '';
  grid.style.gridTemplateColumns = 'repeat(' + cols + ', 60px)';
  for (var r = 0; r < rows; r++) {
    for (var c = 0; c < cols; c++) {
      var inp = document.createElement('input');
      inp.type = 'number';
      inp.id = 'cell-' + id + '-' + r + '-' + c;
      inp.value = '0';
      inp.step = 'any';
      grid.appendChild(inp);
    }
  }
}

function getVal(id) { return parseInt(document.getElementById(id).value, 10); }

// ===== Read / Write Matrices =====
function readMatrix(id) {
  var rows = getVal('rows-' + id);
  var cols = getVal('cols-' + id);
  var m = [];
  for (var r = 0; r < rows; r++) {
    var row = [];
    for (var c = 0; c < cols; c++) {
      var v = parseFloat(document.getElementById('cell-' + id + '-' + r + '-' + c).value);
      row.push(isNaN(v) ? 0 : v);
    }
    m.push(row);
  }
  return m;
}

function randomFill(id) {
  var rows = getVal('rows-' + id);
  var cols = getVal('cols-' + id);
  for (var r = 0; r < rows; r++) {
    for (var c = 0; c < cols; c++) {
      document.getElementById('cell-' + id + '-' + r + '-' + c).value = Math.floor(Math.random() * 19) - 9;
    }
  }
}

function clearMatrix(id) {
  var rows = getVal('rows-' + id);
  var cols = getVal('cols-' + id);
  for (var r = 0; r < rows; r++) {
    for (var c = 0; c < cols; c++) {
      document.getElementById('cell-' + id + '-' + r + '-' + c).value = '0';
    }
  }
}

function identityFill(id) {
  var rows = getVal('rows-' + id);
  var cols = getVal('cols-' + id);
  for (var r = 0; r < rows; r++) {
    for (var c = 0; c < cols; c++) {
      document.getElementById('cell-' + id + '-' + r + '-' + c).value = (r === c) ? '1' : '0';
    }
  }
}

// ===== Display Helpers =====
function renderMatrix(m) {
  var rows = m.length;
  var cols = m[0].length;
  var html = '<div class="result-matrix" style="grid-template-columns:repeat(' + cols + ',1fr);">';
  for (var r = 0; r < rows; r++) {
    for (var c = 0; c < cols; c++) {
      var v = m[r][c];
      html += '<div class="result-cell">' + fmtNum(v) + '</div>';
    }
  }
  html += '</div>';
  return html;
}

function fmtNum(n) {
  if (Number.isInteger(n)) return n.toString();
  return parseFloat(n.toFixed(6)).toString();
}

function showError(msg) {
  document.getElementById('result-content').innerHTML = '<span class="error-msg">' + msg + '</span>';
  document.getElementById('steps-area').style.display = 'none';
}

function matLabel(id, r, c) {
  return id.toUpperCase() + '<span class="subscript">' + (r+1) + ',' + (c+1) + '</span>';
}

// ===== Matrix Operations =====

function matAdd(a, b) {
  var rows = a.length, cols = a[0].length;
  var result = [];
  for (var r = 0; r < rows; r++) {
    var row = [];
    for (var c = 0; c < cols; c++) { row.push(a[r][c] + b[r][c]); }
    result.push(row);
  }
  return result;
}

function matSub(a, b) {
  var rows = a.length, cols = a[0].length;
  var result = [];
  for (var r = 0; r < rows; r++) {
    var row = [];
    for (var c = 0; c < cols; c++) { row.push(a[r][c] - b[r][c]); }
    result.push(row);
  }
  return result;
}

function matMul(a, b) {
  var rA = a.length, cA = a[0].length, cB = b[0].length;
  var result = [];
  for (var r = 0; r < rA; r++) {
    var row = [];
    for (var c = 0; c < cB; c++) {
      var sum = 0;
      for (var k = 0; k < cA; k++) { sum += a[r][k] * b[k][c]; }
      row.push(sum);
    }
    result.push(row);
  }
  return result;
}

function matTranspose(a) {
  var rows = a.length, cols = a[0].length;
  var result = [];
  for (var c = 0; c < cols; c++) {
    var row = [];
    for (var r = 0; r < rows; r++) { row.push(a[r][c]); }
    result.push(row);
  }
  return result;
}

// Determinant via cofactor expansion (recursive, bounded to 5x5)
function matDet(m) {
  var n = m.length;
  if (n === 1) return m[0][0];
  if (n === 2) return m[0][0] * m[1][1] - m[0][1] * m[1][0];
  var det = 0;
  for (var c = 0; c < n; c++) {
    var sub = minor(m, 0, c);
    det += ((c % 2 === 0) ? 1 : -1) * m[0][c] * matDet(sub);
  }
  return det;
}

function minor(m, row, col) {
  var result = [];
  for (var r = 0; r < m.length; r++) {
    if (r === row) continue;
    var newRow = [];
    for (var c = 0; c < m[0].length; c++) {
      if (c === col) continue;
      newRow.push(m[r][c]);
    }
    result.push(newRow);
  }
  return result;
}

// Inverse via adjugate method: A^-1 = adj(A) / det(A)
function matInverse(m) {
  var n = m.length;
  var det = matDet(m);
  if (Math.abs(det) < 1e-12) return null;

  // Build cofactor matrix
  var cof = [];
  for (var r = 0; r < n; r++) {
    var row = [];
    for (var c = 0; c < n; c++) {
      var sign = ((r + c) % 2 === 0) ? 1 : -1;
      row.push(sign * matDet(minor(m, r, c)));
    }
    cof.push(row);
  }

  // Transpose cofactor to get adjugate
  var adj = matTranspose(cof);

  // Divide by determinant
  var inv = [];
  for (var r = 0; r < n; r++) {
    var row = [];
    for (var c = 0; c < n; c++) { row.push(adj[r][c] / det); }
    inv.push(row);
  }
  return inv;
}

// Eigenvalues for 2x2 and 3x3
function matEigenvalues(m) {
  var n = m.length;
  if (n === 2) return eigen2x2(m);
  if (n === 3) return eigen3x3(m);
  return null;
}

function eigen2x2(m) {
  // Characteristic polynomial: lambda^2 - trace*lambda + det = 0
  var a = m[0][0], b = m[0][1], c = m[1][0], d = m[1][1];
  var trace = a + d;
  var det = a * d - b * c;
  var disc = trace * trace - 4 * det;
  if (disc >= 0) {
    var sq = Math.sqrt(disc);
    return { real: [(trace + sq) / 2, (trace - sq) / 2], complex: false };
  } else {
    var realPart = trace / 2;
    var imagPart = Math.sqrt(-disc) / 2;
    return { real: [realPart, realPart], imag: [imagPart, -imagPart], complex: true };
  }
}

function eigen3x3(m) {
  // Characteristic polynomial: -lambda^3 + tr*lambda^2 - s*lambda + det = 0
  // where tr = trace, s = sum of 2x2 minors on diagonal, det = determinant
  var a = m[0][0], b = m[0][1], c = m[0][2];
  var d = m[1][0], e = m[1][1], f = m[1][2];
  var g = m[2][0], h = m[2][1], k = m[2][2];

  var tr = a + e + k;
  // Sum of principal 2x2 minors
  var s = (a*e - b*d) + (a*k - c*g) + (e*k - f*h);
  var det = matDet(m);

  // Solve: lambda^3 - tr*lambda^2 + s*lambda - det = 0
  return solveCubic(1, -tr, s, -det);
}

// Solve ax^3 + bx^2 + cx + d = 0 using Cardano's method
function solveCubic(a, b, c, d) {
  // Normalize
  b /= a; c /= a; d /= a;

  var p = c - b*b/3;
  var q = 2*b*b*b/27 - b*c/3 + d;
  var disc = q*q/4 + p*p*p/27;

  var roots;
  if (Math.abs(disc) < 1e-10) {
    // All real, at least two equal
    if (Math.abs(p) < 1e-10) {
      roots = { real: [-b/3, -b/3, -b/3], complex: false };
    } else {
      var u = 3*q/p;
      roots = { real: [u - b/3, -u/2 - b/3, -u/2 - b/3], complex: false };
    }
  } else if (disc > 0) {
    // One real root, two complex conjugates
    var sqD = Math.sqrt(disc);
    var u = cbrt(-q/2 + sqD);
    var v = cbrt(-q/2 - sqD);
    var realRoot = u + v - b/3;
    var realPart = -(u+v)/2 - b/3;
    var imagPart = Math.sqrt(3)/2 * (u - v);
    roots = {
      real: [realRoot, realPart, realPart],
      imag: [0, imagPart, -imagPart],
      complex: true
    };
  } else {
    // Three distinct real roots (casus irreducibilis)
    var r = Math.sqrt(-p*p*p/27);
    var phi = Math.acos(-q / (2*r));
    var t = 2 * cbrt(r);
    roots = {
      real: [
        t * Math.cos(phi/3) - b/3,
        t * Math.cos((phi + 2*Math.PI)/3) - b/3,
        t * Math.cos((phi + 4*Math.PI)/3) - b/3
      ],
      complex: false
    };
  }
  return roots;
}

function cbrt(x) { return x < 0 ? -Math.pow(-x, 1/3) : Math.pow(x, 1/3); }

// ===== Step-by-step generators =====

function stepsAdd(a, b, op) {
  var steps = [];
  var sign = op === 'add' ? '+' : '-';
  var rows = a.length, cols = a[0].length;
  for (var r = 0; r < rows && steps.length < 6; r++) {
    for (var c = 0; c < cols && steps.length < 6; c++) {
      var val = op === 'add' ? (a[r][c] + b[r][c]) : (a[r][c] - b[r][c]);
      steps.push('<div class="step"><div class="step-label">C<span class="subscript">' + (r+1) + ',' + (c+1) + '</span></div><div class="formula">' + fmtNum(a[r][c]) + ' ' + sign + ' ' + fmtNum(b[r][c]) + ' = ' + fmtNum(val) + '</div></div>');
    }
  }
  if (rows * cols > 6) steps.push('<div class="step" style="color:var(--text-muted)">...and ' + (rows*cols - 6) + ' more elements</div>');
  return steps.join('');
}

function stepsMul(a, b) {
  var steps = [];
  var rA = a.length, cA = a[0].length, cB = b[0].length;
  var shown = 0;
  for (var r = 0; r < rA && shown < 4; r++) {
    for (var c = 0; c < cB && shown < 4; c++) {
      var terms = [];
      var sum = 0;
      for (var k = 0; k < cA; k++) {
        terms.push(fmtNum(a[r][k]) + ' * ' + fmtNum(b[k][c]));
        sum += a[r][k] * b[k][c];
      }
      steps.push('<div class="step"><div class="step-label">C<span class="subscript">' + (r+1) + ',' + (c+1) + '</span></div><div class="formula">' + terms.join(' + ') + ' = ' + fmtNum(sum) + '</div></div>');
      shown++;
    }
  }
  if (rA * cB > 4) steps.push('<div class="step" style="color:var(--text-muted)">...and ' + (rA*cB - 4) + ' more elements</div>');
  return steps.join('');
}

function stepsDet(m) {
  var n = m.length;
  if (n === 2) {
    var a = m[0][0], b = m[0][1], c = m[1][0], d = m[1][1];
    return '<div class="step"><div class="step-label">2x2 Determinant Formula</div><div class="formula">det = a<span class="subscript">1,1</span> * a<span class="subscript">2,2</span> - a<span class="subscript">1,2</span> * a<span class="subscript">2,1</span></div></div>' +
           '<div class="step"><div class="formula">= ' + fmtNum(a) + ' * ' + fmtNum(d) + ' - ' + fmtNum(b) + ' * ' + fmtNum(c) + '</div></div>' +
           '<div class="step"><div class="formula">= ' + fmtNum(a*d) + ' - ' + fmtNum(b*c) + ' = ' + fmtNum(a*d - b*c) + '</div></div>';
  }
  var steps = '<div class="step"><div class="step-label">Cofactor Expansion along Row 1</div></div>';
  var terms = [];
  for (var c = 0; c < n; c++) {
    var sign = (c % 2 === 0) ? '+' : '-';
    var minorDet = matDet(minor(m, 0, c));
    terms.push(sign + ' ' + fmtNum(m[0][c]) + ' * M<span class="subscript">1,' + (c+1) + '</span>(' + fmtNum(minorDet) + ')');
  }
  steps += '<div class="step"><div class="formula">det = ' + terms.join(' ') + '</div></div>';
  steps += '<div class="step"><div class="formula">= ' + fmtNum(matDet(m)) + '</div></div>';
  return steps;
}

function stepsInverse(m) {
  var det = matDet(m);
  var steps = '<div class="step"><div class="step-label">Inverse via Adjugate Method</div><div class="formula">A<span class="superscript">-1</span> = adj(A) / det(A)</div></div>';
  steps += '<div class="step"><div class="formula">det(A) = ' + fmtNum(det) + '</div></div>';
  steps += '<div class="step"><div class="step-label">1. Compute cofactor matrix</div><div class="formula">C<span class="subscript">i,j</span> = (-1)<span class="superscript">i+j</span> * M<span class="subscript">i,j</span></div></div>';
  steps += '<div class="step"><div class="step-label">2. Transpose cofactor matrix to get adjugate</div></div>';
  steps += '<div class="step"><div class="step-label">3. Divide each element by det(A) = ' + fmtNum(det) + '</div></div>';
  return steps;
}

function stepsEigen2x2(m) {
  var a = m[0][0], d = m[1][1];
  var trace = a + d;
  var det = matDet(m);
  var disc = trace*trace - 4*det;
  var steps = '<div class="step"><div class="step-label">Characteristic Polynomial (2x2)</div><div class="formula">&lambda;<span class="superscript">2</span> - tr(A)&lambda; + det(A) = 0</div></div>';
  steps += '<div class="step"><div class="formula">tr(A) = ' + fmtNum(a) + ' + ' + fmtNum(d) + ' = ' + fmtNum(trace) + '</div></div>';
  steps += '<div class="step"><div class="formula">det(A) = ' + fmtNum(det) + '</div></div>';
  steps += '<div class="step"><div class="formula">&lambda;<span class="superscript">2</span> - ' + fmtNum(trace) + '&lambda; + ' + fmtNum(det) + ' = 0</div></div>';
  steps += '<div class="step"><div class="formula">Discriminant = ' + fmtNum(trace) + '<span class="superscript">2</span> - 4(' + fmtNum(det) + ') = ' + fmtNum(disc) + '</div></div>';
  return steps;
}

function stepsEigen3x3(m) {
  var tr = m[0][0] + m[1][1] + m[2][2];
  var det = matDet(m);
  var steps = '<div class="step"><div class="step-label">Characteristic Polynomial (3x3)</div><div class="formula">&lambda;<span class="superscript">3</span> - tr(A)&lambda;<span class="superscript">2</span> + s&lambda; - det(A) = 0</div></div>';
  steps += '<div class="step"><div class="formula">tr(A) = ' + fmtNum(tr) + ', det(A) = ' + fmtNum(det) + '</div></div>';
  steps += '<div class="step"><div class="step-label">Solved using Cardano\'s method</div></div>';
  return steps;
}

// ===== Main Calculate =====
function calculate() {
  var a = readMatrix('a');
  var rA = a.length, cA = a[0].length;
  var resultEl = document.getElementById('result-content');
  var stepsEl = document.getElementById('steps-content');
  var stepsArea = document.getElementById('steps-area');
  var stepsHtml = '';
  var resultHtml = '';
  var historyLabel = '';

  try {
    if (currentOp === 'add' || currentOp === 'subtract') {
      var b = readMatrix('b');
      if (rA !== b.length || cA !== b[0].length) { showError('Matrices must have the same dimensions for ' + currentOp + '.'); return; }
      var res = currentOp === 'add' ? matAdd(a, b) : matSub(a, b);
      resultHtml = renderMatrix(res);
      stepsHtml = stepsAdd(a, b, currentOp);
      historyLabel = rA + 'x' + cA + ' A ' + (currentOp === 'add' ? '+' : '-') + ' B';
    }
    else if (currentOp === 'multiply') {
      var b = readMatrix('b');
      if (cA !== b.length) { showError('Matrix A columns (' + cA + ') must equal Matrix B rows (' + b.length + ') for multiplication.'); return; }
      var res = matMul(a, b);
      resultHtml = renderMatrix(res);
      stepsHtml = stepsMul(a, b);
      historyLabel = rA + 'x' + cA + ' * ' + b.length + 'x' + b[0].length;
    }
    else if (currentOp === 'transpose') {
      var res = matTranspose(a);
      resultHtml = renderMatrix(res);
      stepsHtml = '<div class="step"><div class="step-label">Transpose</div><div class="formula">A<span class="superscript">T</span><span class="subscript">i,j</span> = A<span class="subscript">j,i</span></div></div>';
      stepsHtml += '<div class="step"><div class="formula">' + rA + 'x' + cA + ' becomes ' + cA + 'x' + rA + '</div></div>';
      historyLabel = 'Transpose ' + rA + 'x' + cA;
    }
    else if (currentOp === 'determinant') {
      if (rA !== cA) { showError('Matrix must be square for determinant.'); return; }
      var det = matDet(a);
      resultHtml = '<div class="scalar-result">det(A) = ' + fmtNum(det) + '</div>';
      stepsHtml = stepsDet(a);
      historyLabel = 'det(' + rA + 'x' + cA + ') = ' + fmtNum(det);
    }
    else if (currentOp === 'inverse') {
      if (rA !== cA) { showError('Matrix must be square for inverse.'); return; }
      var inv = matInverse(a);
      if (!inv) { showError('Matrix is singular (determinant = 0). No inverse exists.'); return; }
      resultHtml = renderMatrix(inv);
      stepsHtml = stepsInverse(a);
      historyLabel = 'Inverse ' + rA + 'x' + cA;
    }
    else if (currentOp === 'eigenvalues') {
      if (rA !== cA) { showError('Matrix must be square for eigenvalues.'); return; }
      if (rA > 3) { showError('Eigenvalue calculation is supported for 2x2 and 3x3 matrices only.'); return; }
      var eig = matEigenvalues(a);
      if (!eig) { showError('Could not compute eigenvalues.'); return; }
      resultHtml = '<div class="scalar-result">';
      for (var i = 0; i < eig.real.length; i++) {
        resultHtml += '&lambda;<span class="subscript">' + (i+1) + '</span> = ' + fmtNum(eig.real[i]);
        if (eig.complex && eig.imag && Math.abs(eig.imag[i]) > 1e-10) {
          resultHtml += (eig.imag[i] > 0 ? ' + ' : ' - ') + fmtNum(Math.abs(eig.imag[i])) + 'i';
        }
        if (i < eig.real.length - 1) resultHtml += '<br>';
      }
      resultHtml += '</div>';
      stepsHtml = (rA === 2) ? stepsEigen2x2(a) : stepsEigen3x3(a);
      historyLabel = 'Eigenvalues ' + rA + 'x' + cA;
    }

    resultEl.innerHTML = resultHtml;
    stepsEl.innerHTML = stepsHtml;
    stepsArea.style.display = stepsHtml ? '' : 'none';

    // History
    if (historyLabel) {
      history.unshift(historyLabel);
      if (history.length > 5) history.pop();
      renderHistory();
    }
  } catch (e) {
    showError('Calculation error: ' + e.message);
  }
}

function renderHistory() {
  var html = '';
  for (var i = 0; i < history.length; i++) {
    html += '<div class="history-item">' + (i+1) + '. ' + history[i] + '</div>';
  }
  document.getElementById('history-content').innerHTML = html || '<span style="color:var(--text-muted);font-size:0.85rem;">No calculations yet.</span>';
}

// ===== Init =====
rebuildMatrices();
updatePanelVisibility();
