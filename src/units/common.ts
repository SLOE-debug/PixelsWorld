import { limb } from "../PersonModels/Person";

export function defaultLimbs() {
  return [
    {
      type: "leg",
      name: "右腿",
      size: 2,
      height: 8,
      order: 1,
      x: -2,
      max: 3,
    },
    {
      type: "leg",
      name: "左腿",
      size: 2,
      height: 8,
      order: 1,
      x: 2,
      max: 3,
      secondary: true,
    },
    {
      type: "arm",
      name: "右手",
      size: 1.5,
      height: 8,
      order: 2,
      x: -3.5,
      max: 2,
      secondary: true,
    },
    {
      type: "arm",
      name: "左手",
      size: 1.5,
      height: 8,
      order: 2,
      x: 3.5,
      max: 2,
    },
    {
      type: "body",
      name: "身体",
      size: 5,
      height: 8,
      order: 2,
      max: 5,
    },
    {
      type: "head",
      name: "头",
      size: 4,
      height: 4,
      order: 3,
      max: 6,
    },
    {
      type: "eye",
      name: "左眼",
      size: 0.5,
      height: 0.5,
      order: 3,
      color: "black",
      max: 2,
      parentType: "head",
      y: -3.5,
      z: 2,
      x: -1,
    },
    {
      type: "eye",
      name: "右眼",
      size: 0.5,
      height: 0.5,
      order: 3,
      color: "black",
      max: 2,
      parentType: "head",
      y: -3.5,
      z: 2,
      x: 1,
    },
  ] as Array<limb>;
}

export function throttle(millisecond: number) {
  return function (
    target,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    let time;
    descriptor.value = (function (func: Function) {
      return function () {
        if (!time) {
          func.apply(this, arguments);
          time = setTimeout(() => {
            time = null;
          }, millisecond * 1000);
        }
      };
    })(descriptor.value);
  };
}
