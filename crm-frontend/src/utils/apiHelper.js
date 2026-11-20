export const isValidResponse = (res) => {
  return res?.data?.status === "true";
};

export const extractData = (res) => {
  if (res?.data?.status === "true") {
    return res.data.data || [];
  }
  return [];
};
