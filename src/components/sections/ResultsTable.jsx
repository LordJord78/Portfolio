import { RESULTS, money } from "../../data/results.js";
import "./ResultsTable.css";

const MAX = Math.max(...RESULTS.map((r) => Math.abs(r.net)));

export default function ResultsTable() {
  return (
    <div className="rt">
      <div className="rt__scroll" tabIndex={0} role="region" aria-label="Economic results, scrollable">
        <table className="rt__table">
          <caption className="rt__caption">
            Threshold 0.50, evaluation region, five walk-forward folds. The final
            column is an upper bound on realised P&amp;L, not an estimate.
          </caption>
          <thead>
            <tr>
              <th scope="col">Horizon</th>
              <th scope="col">Side</th>
              <th scope="col" className="rt__r">
                Trades
              </th>
              <th scope="col" className="rt__r">
                Gross
              </th>
              <th scope="col" className="rt__r">
                After known costs
              </th>
            </tr>
          </thead>
          <tbody>
            {RESULTS.map((r) => (
              <tr key={`${r.h}-${r.side}`}>
                <th scope="row" className="u-mono u-num">
                  {r.h}
                  <span className="rt__unit"> bar</span>
                </th>
                <td>
                  <span className={`rt__side rt__side--${r.side}`}>{r.side}</span>
                </td>
                <td className="rt__r u-mono u-num rt__dim">{r.n}</td>
                <td
                  className={`rt__r u-mono u-num ${r.gross >= 0 ? "rt__pos" : "rt__neg"}`}
                >
                  {money(r.gross)}
                </td>
                <td className="rt__r rt__net">
                  <span
                    className="rt__meter"
                    style={{ "--w": `${(Math.abs(r.net) / MAX) * 100}%` }}
                    aria-hidden="true"
                  />
                  <span className="u-mono u-num rt__neg">{money(r.net)}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
