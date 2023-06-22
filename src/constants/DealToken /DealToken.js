const DealToken = (
  duration,
  terms,
  ownerAddress,
  tenantAddress,
  startDate,
  endDate,
  warnings,
  score
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
      warnings,
      score,
    },
  };
};

export default DealToken;
