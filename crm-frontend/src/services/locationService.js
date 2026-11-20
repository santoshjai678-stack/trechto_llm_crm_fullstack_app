import api from "./api";
import { extractData } from "../utils/apiHelper";

// 🌍 Get all countries
export const getCountries = async () => {
  try {
    const res = await api.get("/get_country");
    return extractData(res);
  } catch (error) {
    return [];
  }
};

// 🏙 Get states
export const getStates = async (country_id) => {
  if (!country_id) return [];

  try {
    const res = await api.post("/get_state", { country_id });
    return extractData(res);
  } catch (error) {
    return [];
  }
};

// 🏘 Get cities
export const getCities = async (country_id, state_id) => {
  if (!country_id || !state_id) return [];

  try {
    const res = await api.post("/get_city", { country_id, state_id });
    return extractData(res);
  } catch (error) {
    return [];
  }
};

// 🌍 Get countries list with params
export const getCountriesList = async (params = {}) => {
  try {
    const res = await api.get("/get_country_list", { params });
    return res.data; // return full response (data + pagination)
  } catch (error) {
    console.error("Country API Error:", error);
    return null;
  }
};

export const updateCountryStatus = (data) => {
  return api.post("/update_country_status", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const addCountry = (data) => {
  return api.post("/add_country", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const updateCountry = (data) => {
  return api.post("/update_country", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const deleteCountry = (data) => {
  return api.post("/delete_country", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

// 🌍 Get State list with params (optional signal for cancellation)
export const getStateList = async (params = {}, signal = null) => {
  try {
    const config = { params };
    if (signal) config.signal = signal;
    const res = await api.get("/get_state_list", config);
    return res.data; // return full response (data + pagination)
  } catch (error) {
    if (error.name === "CanceledError" || error.code === "ERR_CANCELED") return null;
    console.error("State API Error:", error);
    return null;
  }
};

export const updateStateStatus = (data) => {
  return api.post("/update_state_status", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const addState = (data) => {
  return api.post("/add_state", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const updateState = (data) => {
  return api.post("/update_state", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const deleteState = (data) => {
  return api.post("/delete_state", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};


// 🌍 Get City list with params (optional signal for cancellation)
export const getCityList = async (params = {}, signal = null) => {
  try {
    const config = { params };
    if (signal) config.signal = signal;
    const res = await api.get("/get_city_list", config);
    return res.data; // return full response (data + pagination)
  } catch (error) {
    if (error.name === "CanceledError" || error.code === "ERR_CANCELED") return null;
    console.error("City API Error:", error);
    return null;
  }
};

export const updateCityStatus = (data) => {
  return api.post("/update_city_status", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const addCity = (data) => {
  return api.post("/add_city", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const updateCity = (data) => {
  return api.post("/update_city", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const deleteCity = (data) => {
  return api.post("/delete_city", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};



