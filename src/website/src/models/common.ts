export class UserInfoData {
    value: string = ""
    ok: boolean = false
}

export enum UserInfoField {
    Name, Org
}

export class UserInfo {
    public Name = new UserInfoData()
    public Org = new UserInfoData()
    private readonly REJECT_REGEX = /[^\wA-Z\-_]+/g

    private rectifyField(value: string) {
        const newFieldData = new UserInfoData()
        newFieldData.value = value.replaceAll(this.REJECT_REGEX, "")
        newFieldData.ok = value.length>0 && !value.match(this.REJECT_REGEX)?.length
        return newFieldData
    }

    public SafeSet(key: UserInfoField, value: string) {
        let me: any = this
        if (!Object.keys(this).includes(UserInfoField[key])) return false
        const f = this.rectifyField(value)
        if (!f.ok) return false
        me[UserInfoField[key]] = f
        return true
    }

    public ToDict() {
        let dict: any = {}
        for (let [k, v] of Object.entries(this)) {
            if(v === undefined) continue
            dict[k] = v.value
        }
        return dict
    }

    public FromDict(uinfo: any) {
        if (!uinfo) return false
        const uinfoKeys = Object.keys(uinfo)
        for (let i of Object.keys(UserInfoField)) {
            if (isNaN(parseInt(i))) continue
            const k = UserInfoField[parseInt(i)]
            if (!uinfoKeys.includes(k)) { return false }
            if (!this.SafeSet(parseInt(i) as UserInfoField, uinfo[k])) { return false }
        }
        return true
    }
}
