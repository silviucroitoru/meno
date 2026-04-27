import { useIntl } from "react-intl";

export function useTranslate() {
  const intl = useIntl();

  return {
    t: (id, values) => intl.formatMessage({ id }, values),
  };
}

