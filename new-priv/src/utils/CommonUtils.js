const commonPrefix = (string1, string2) => {
  const len = string1.length;
  let i = 0;

  while (i < len && string1.charAt(i) === string2.charAt(i)) {
    i += 1;
  }
  return string1.substring(0, i);
};
export const commonArrayPrefix = (sortedArray) => {
  const string1 = sortedArray[0];
  const string2 = sortedArray[sortedArray.length - 1];
  return commonPrefix(string1, string2);
};

export const isMfa = str => str.includes(':') && str.includes('/');
export const getLanguageGuides = (mode) => {
  if (!mode) {
    return {
      language: null,
      type: null,
      example: null,
    };
  } else if (mode === 'elixir') {
    return {
      language: 'Elixir',
      type: 'query',
      example: 'Enum.member?(_, :test)',
    };
  }
  return {
    language: 'Erlang',
    type: 'trace pattern',
    example: 'ets:lookup(data, _)',
  };
};
export const mfaToObject = mfa => ({
  module: mfa[0],
  function: mfa[1],
  arity: mfa[2],
  complete: mfa[3],
});
export const mfaToArr = mfa => [mfa.module, mfa.function, mfa.arity, mfa.complete];
