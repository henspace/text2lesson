/**
 * @file HTML entities and character codes
 *
 * @module utils/text/entities
 *
 * @license GPL-3.0-or-later
 * Create quizzes and lessons from plain text files.
 * Copyright 2023 Steve Butler (henspace.com)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 */

export const Entities = {
  Maths: {
    CENTRE_DOT: { html: '&sdot;', unicode: '\u{22c5}' },
    DIVIDE: { html: '&divide;', unicode: '\u{00f7}' },
    EQUALS: { html: '&equals;', unicode: '\u{003d}' },
    FUNCTION: { html: '&fnof;', unicode: '\u{0192}' },
    GREATER_THAN: { html: '&gt;', unicode: '\u{003e}' },
    GREATER_THAN_OR_EQUAL: { html: '&ge;', unicode: '\u{2265}' },
    INTEGRAL: { html: '&int;', unicode: '\u{222b}' },
    LESS_THAN: { html: '&lt;', unicode: '\u{003c}' },
    LESS_THAN_OR_EQUAL: { html: '&le;', unicode: '\u{2264}' },
    MINUS: { html: '&minus;', unicode: '\u{2212}' },
    NOT_EQUAL: { html: '&ne;', unicode: '\u{2260}' },
    PARTIAL: { html: '&part;', unicode: '\u{2202}' },
    PLUS: { html: '&plus;', unicode: '\u{002b}' },
    SQRT: { html: '&radic;', unicode: '\u{221a}' },
    SUM: { html: '&sum;', unicode: '\u{2211}' },
    TIMES: { html: '&times;', unicode: '\u{00d7}' },
  },
  Greek: {
    Alpha: { html: '&Alpha;', unicode: '\u{0391}' },
    Beta: { html: '&Beta;', unicode: '\u{0392}' },
    Gamma: { html: '&Gamma;', unicode: '\u{0393}' },
    Delta: { html: '&Delta;', unicode: '\u{0394}' },
    Epsilon: { html: '&Epsilon;', unicode: '\u{0395}' },
    Zeta: { html: '&Zeta;', unicode: '\u{0396}' },
    Eta: { html: '&Eta;', unicode: '\u{0397}' },
    Theta: { html: '&Theta;', unicode: '\u{0398}' },
    Iota: { html: '&Iota;', unicode: '\u{0399}' },
    Kappa: { html: '&Kappa;', unicode: '\u{039a}' },
    Lambda: { html: '&Lambda;', unicode: '\u{039b}' },
    Mu: { html: '&Mu;', unicode: '\u{039c}' },
    Nu: { html: '&Nu;', unicode: '\u{039d}' },
    Xi: { html: '&Xi;', unicode: '\u{039e}' },
    Omicron: { html: '&Omicron;', unicode: '\u{039f}' },
    Pi: { html: '&Pi;', unicode: '\u{03a0}' },
    Rho: { html: '&Rho;', unicode: '\u{03a1}' },
    Sigma: { html: '&Sigma;', unicode: '\u{03a3}' },
    Tau: { html: '&Tau;', unicode: '\u{03a4}' },
    Upsilon: { html: '&Upsilon;', unicode: '\u{03a5}' },
    Phi: { html: '&Phi;', unicode: '\u{03a6}' },
    Chi: { html: '&Chi;', unicode: '\u{03a7}' },
    Psi: { html: '&Psi;', unicode: '\u{03a8}' },
    Omega: { html: '&Omega;', unicode: '\u{03a9}' },

    alpha: { html: '&alpha;', unicode: '\u{03b1}' },
    beta: { html: '&beta;', unicode: '\u{03b2}' },
    gamma: { html: '&gamma;', unicode: '\u{03b3}' },
    delta: { html: '&delta;', unicode: '\u{03b4}' },
    epsilon: { html: '&epsilon;', unicode: '\u{03b5}' },
    zeta: { html: '&zeta;', unicode: '\u{03b6}' },
    eta: { html: '&eta;', unicode: '\u{03b7}' },
    theta: { html: '&theta;', unicode: '\u{03b8}' },
    iota: { html: '&iota;', unicode: '\u{03b9}' },
    kappa: { html: '&kappa;', unicode: '\u{03ba}' },
    lambda: { html: '&lambda;', unicode: '\u{03bb}' },
    mu: { html: '&mu;', unicode: '\u{03bc}' },
    nu: { html: '&nu;', unicode: '\u{03bd}' },
    xi: { html: '&xi;', unicode: '\u{03be}' },
    omicron: { html: '&omicron;', unicode: '\u{03bf}' },
    pi: { html: '&pi;', unicode: '\u{03c0}' },
    rho: { html: '&rho;', unicode: '\u{03c1}' },
    sigmaf: { html: '&sigmaf;', unicode: '\u{03c2}' },
    sigma: { html: '&sigma;', unicode: '\u{03c3}' },
    tau: { html: '&tau;', unicode: '\u{03c4}' },
    upsilon: { html: '&upsilon;', unicode: '\u{03c5}' },
    phi: { html: '&phi;', unicode: '\u{03c6}' },
    chi: { html: '&chi;', unicode: '\u{03c7}' },
    psi: { html: '&psi;', unicode: '\u{03c8}' },
    omega: { html: '&omega;', unicode: '\u{03c9}' },
  },
};
