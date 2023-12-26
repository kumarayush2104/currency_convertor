import React, { useEffect, useState } from 'react'
import { ThreeDots } from 'react-loader-spinner';

export default function App() {

  const [error, set_error] = useState(null);
  const [loading, set_loading] = useState(null);
  const [amount, set_amount] = useState(1);
  const [from_currency, set_from_currency] = useState("CAD");
  const [to_currency, set_to_currency] = useState("USD");
  const [dark_mode, set_dark_mode] = useState(false);
  const [exchange_currency_data, set_exchange_currency_data] = useState(null);

  const handle_amount_input = (value) => {
    try {
      const new_amount = parseFloat(value);
      set_amount(new_amount);
    }
    catch (e) { }
  }

  const swap_currency = () => {
    set_from_currency(to_currency);
    set_to_currency(from_currency);
  }

  const parse_date = () => {
    const new_date = new Date(exchange_currency_data.date);
    return new_date.toLocaleDateString(undefined, {year: 'numeric', month: 'long', day: 'numeric'});
  }

  const parse_currency_data = () => {
    const new_exchange_amount = Object.values(exchange_currency_data.rates);
    return new_exchange_amount[0];
  }

  useEffect(() => {
    const api_controller = new AbortController();
    const api_signal = api_controller.signal;

    const exchange_currency = async () => {
      try {
        set_loading(true);
        set_error(false);
        const exchange_currency_request = await fetch(`https://api.frankfurter.app/latest?amount=${amount}&from=${from_currency}&to=${to_currency}`, { signal: api_signal });
        const new_exchange_currency_data = await exchange_currency_request.json();
        set_exchange_currency_data(new_exchange_currency_data);
      } catch (e) {
        if(e.name === "AbortError") return;
        set_error(e.message);
      } finally {
        set_loading(false);
      }
    }

    if (!isNaN(amount) || amount < 1) exchange_currency();
    return () => {
      api_controller.abort();
      set_loading(false);
    }
  }, [amount, from_currency, to_currency]);


  return (
    <div className={`h-100 d-flex justify-content-center align-items-center ${dark_mode ? "dark" : ""}`}>
      <button className={`position-absolute btn light-switcher ${dark_mode ? "dark" : ""}`} onClick={() => set_dark_mode(!dark_mode)}>
        <i className={`fa-solid fa-${dark_mode ? "sun" : "moon"}`}></i>
      </button>

      <div className={`d-flex flex-column align-items-center rounded-4 app ${dark_mode ? "dark" : ""}`}>
        <h2 className="text-center">Currency Convertor</h2>
        <input className="p-2 my-5 rounded" type="number" min="0" value={isNaN(amount) ? "" : amount} onChange={(e) => handle_amount_input(e.target.value)} />
        <select className="p-2 my-2 rounded" value={from_currency} onChange={(e) => set_from_currency(e.target.value)}>
          <option value="CAD">Canadian Dollar</option>
          <option value="CNY">Chinese Yuan</option>
          <option value="EUR">Euro</option>
          <option value="INR">Indian Rupee</option>
          <option value="JPY">Japanese Yen</option>
          <option value="KRW">South Korean won</option>
          <option value="USD">United States Dollar</option>
        </select>

        <button className={`col-2 btn swapper ${dark_mode ? "dark" : ""}`} onClick={swap_currency}>
          <i className="fa-regular fa-arrow-up-arrow-down"></i>
        </button>

        <select className="p-2 my-2 rounded" value={to_currency} onChange={(e) => set_to_currency(e.target.value)}>
          <option value="CAD">Canadian Dollar</option>
          <option value="CNY">Chinese Yuan</option>
          <option value="EUR">Euro</option>
          <option value="INR">Indian Rupee</option>
          <option value="JPY">Japanese Yen</option>
          <option value="KRW">South Korean won</option>
          <option value="USD">United States Dollar</option>
        </select>

        {
          error ? <div className="my-4">{error}</div> :
            isNaN(amount) || !exchange_currency_data ? <></>
              : loading ? <ThreeDots visible={true} height="120" width="80" color="#ffffff" radius="9" ariaLabel="three-dots-loading" />
                : <>
                  <div className="my-3">
                    <h5 className="text-center">{amount} {from_currency} </h5>
                    <h3 className="text-center">{parse_currency_data()} {to_currency}</h3>
                  </div>
                  <p className="align-self-start last-updated fs-6 fst-italic">Last Updated: {parse_date()}</p>
                </>
        }

      </div>
    </div>
  )
}
