const DealToken = (
  duration,
  terms,
  ownerAddress,
  tenantAddress,
  startDate,
  endDate
) => {
  return {
    name: "Deal Token",
    description: "This is a verified rental agreement",
    image: "",
    attributes: {
      duration,
      terms,
      ownerAddress,
      tenantAddress,
      startDate,
      endDate,
    },
  };
};

export default DealToken;
