enum Type {
  DEFAULT,
  TOGGLE
}
export default Type;

export function nameType(given: Type): string {
  switch (given) {
    case Type.TOGGLE:
      return "TOGGLE";
    default:
      return "DEFAULT";
  }
}

export function readType(given: string | Type): Type {
  if (typeof given !== "string") {
    return given as Type;
  }
  given = (given as string).toLowerCase().substring(0, 1);

  switch (given) {
    case "t":
      return Type.TOGGLE;
  }
  return Type.DEFAULT;
}
