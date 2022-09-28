/*
 * @Author: sumku404
 * @Date: 2022-08-19 22:26:33
 * @Description: 
 */
export default interface SendEmailOptionDSN {
        id?          : string,
        return?      : 'headers' | 'full',

        /**Optional value: ['never' | 'success' | 'failure' | 'delay'] */
        notify?      : string[] | 'never' | 'success' | 'failure' | 'delay',
        recipient?   : string
}
