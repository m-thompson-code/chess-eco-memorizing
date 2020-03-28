// json files get impored as modules (where the value is on the attribute 'default')
declare module "*.json" {
  const value: any;
  export default value;
}