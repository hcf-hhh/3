// 公用修改vuex的state的方法
export const setState = (state, data) => {
    // 循环修改，好处是不会更新其他数据
    if (!data || typeof data !== 'object' || !!Array.isArray(data)) {
        throw new Error('setState warning：data需要是Object类型！')
    }
    for (const key in data) {
        state[key] = data[key]
    }
}

// 手机号加密****
export const phoneEncryption = function (phone) {
    return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

// 返回是否是链接
export function isExternal(path) {
    return /^(https?:|mailto:|tel:)/.test(path)
}

// n级数数据处理
// n级数数据处理
export const formatUcOrgTree = function (orgData) {
    orgData = JSON.parse(JSON.stringify(orgData))
    let orgIdArr = orgData.map((item) => item.id)
    let tree = orgData.reduce((arr, item) => {
        if (item.parentId === '0') {
            arr.push(item)
        } else {
            let pIdx = orgIdArr.indexOf(item.parentId)
            if (pIdx > -1) {
                Array.isArray(orgData[pIdx].children) ? orgData[pIdx].children.push(item) : (orgData[pIdx].children = [item])
            }
        }
        return arr
    }, [])
    return tree
}


// n级数数据处理
export const formatOrgTree = function (orgData, curParentId = '0') {
    orgData = JSON.parse(JSON.stringify(orgData))
    let orgIdArr = orgData.map((item) => item.id)
    let tree = orgData.reduce((arr, item) => {
        if (item.parentId === curParentId) {
            arr.push(item)
        } else {
            if (item.path.indexOf('35d6963e94f84558a27e850a374f16c6') === -1 || item.path.indexOf('a83f3cf5b05d435cabe711c0df142f91') === -1) {
                let pIdx = orgIdArr.indexOf(item.parentId)
                if (pIdx > -1) {
                    Array.isArray(orgData[pIdx].children) ? orgData[pIdx].children.push(item) : (orgData[pIdx].children = [item])
                }
            }
        }
        return arr
    }, [])
    return tree
}

export const formatCompanyOrgTree = function (orgData) {
    let filter = orgData.filter(item => (item.grade === 'ORG_QuYu' || item.grade === 'ORG_ChengQu' || item.grade === 'ORG_ZongBu'))
    return formatOrgTree(filter)
}

export const formatClusterOrgTree = function (orgData) {
    let filter = orgData.filter(item => (item.grade === 'ORG_QuYu' || item.grade === 'ORG_ChengQu' || item.grade === 'ORG_ZuTuan' || item.grade === 'ORG_ZongBu'))
    return formatOrgTree(filter)
}

export const getParameter = function (key) {
    var parameters = decodeURI(window.location.search.substr(1)).split('&')
    for (var i = 0; i < parameters.length; i++) {
        var paramCell = parameters[i].split('=')
        if (paramCell.length === 2 && paramCell[0].toUpperCase() === key.toUpperCase()) {
            return paramCell[1]
        }
    }
    return ''
}
// 处理数据流
export const processDataFlow = function (res, name) {
    const content = res
    const blob = new Blob([content])
    // '事项管理列表.xlsx'
    const fileName = name
    if ('download' in document.createElement('a')) {
        // 非IE下载
        const elink = document.createElement('a')
        elink.download = fileName
        elink.style.display = 'none'
        elink.href = URL.createObjectURL(blob)
        document.body.appendChild(elink)
        elink.click()
        URL.revokeObjectURL(elink.href) // 释放URL 对象
        document.body.removeChild(elink)
    } else {
        // IE10+下载
        navigator.msSaveBlob(blob, fileName)
    }
}
// 正整数校验
export const mathValid = function (string) {
    let req = /^[+]{0,1}(\d+)$/
    return req.test(string)
}
// 金额校验
export const moneyValid = function (string) {
    let req = /^([1-9]\d{0,9}|0)([.]?|(\.\d{1,2})?)$/
    return req.test(string)
}
// 汉字转换空
export const charactersChangeNull = function (string) {
    if (Number(string) + '' === 'NaN') {
        if (parseFloat(string) + '' === 'NaN') {
            return ''
        } else {
            return parseFloat(string)
        }
    } else {
        return string
    }
}
// 数字小数点
export const numberFormatter = function (val, number, type) {
    if (val && Number(val) + '' !== 'NaN') {
        let arr = val.toString().split('.')
        let value = ''
        if (arr.length > 1) {
            arr[1] = arr[1].substring(0, number)
            value = arr[0] + '.' + arr[1]
        } else {
            value = val
        }
        return numToThousandSep(Number(value)) + type
    } else {
        return 0 + type
    }
}
// 将千分位值转换成number
export const thousandSepToNum = function (value) {
    if (!value) return ''
    let strArr = String(value).split('.')
    let n1 = strArr[0].replace(/,/g, '')
    return strArr[1] ? `${n1}.${strArr[1]}` : `${n1}`
}

export const numToThousandSepToFixed = function (val,fixNumber) {
    if (val && Number(val) + '' !== 'NaN') {
        val = Number(val).toFixed(fixNumber);
        return numToThousandSep(val);
    }else{
        return val;
    }
}

// 将Number转换成千分位
export const numToThousandSep = function (value) {
    let type = false
    let val = 0
    if (value == undefined) {
        return 0
    }
    if (Number(value) < 1000 && Number(value) > -1000) {
        return value
    }
    if (value < 0) {
        type = true
        val = String(value).slice(1)
    } else {
        type = false
        val = value
    }
    // 大于等于1000处理成千分位字符串
    let valueArr = String(val).split('.')
    if (!val || (Number(val) < 1000 && Number(val) > -1000)) {
        if (!valueArr[1]) {
            return valueArr[0]
        }
        return val
    }
    let intNum = valueArr[0]
    let len = intNum.length
    let remainder = len % 3
    let resultStr =
        remainder > 0
            ? intNum.slice(0, remainder) +
            ',' +
            intNum
                .slice(remainder, len)
                .match(/\d{3}/g)
                .join(',')
            : intNum
                .slice(remainder, len)
                .match(/\d{3}/g)
                .join(',')
    if (type) {
        return valueArr[1] ? `-${resultStr}.${valueArr[1]}` : '-' + resultStr
    } else {
        return valueArr[1] ? `${resultStr}.${valueArr[1]}` : resultStr
    }
}

// 处理菜单权限
export const menuFormat = function (value) {
    let menuArr = []
    let handleMenu = function (arr) {
        if (arr && arr.length == 0) {
            return
        }
        arr.forEach(item => {
            if (item.menuUrl && item.menuUrl.includes('{link}')) {
                // vue页面
                let key = (item.templateUrl && item.templateUrl.split('/').pop()) || item.menuUrl.split('/').pop()
                if (!!key) { menuArr.push(key) }
            }
            if (item.children) {
                // 如果有孩子，就执行
                handleMenu(item.children)
            }
        })
    }
    handleMenu(value)
    return menuArr
}

// 从node对象children中递归出id数组 --- 仅供组织树点击使用 ！！！
export const recursion = function (node) {
    let ids = []
    if(!node.id) {
        return ids
    }
    ids.push(node.id)
    let handleMenu = function (arr) {
        if (!arr || arr && arr.length == 0) {
            return
        }
        arr.forEach(item => {
            ids.push(item.id)
            if (item.children) {
                // 如果有孩子，就执行
                handleMenu(item.children)
            }
        })
    }
    handleMenu(node.children)
    return ids
}

// 判断两个字符串是否相等（不区分大小写）
export function strIsEqual(str1, str2) {
    if (str1 && str2 && str1.toLowerCase() === str2.toLowerCase()) {
        return true
    }
    if (str1 && str2 && str2.toLowerCase().includes(str1.toLowerCase())) {
        return true
    }
    return false
}
// pickerOption
export const pickerOption = function (startYear, endYear) {
    return {
        disabledDate: (time) => {
            return time.getFullYear() < startYear || time.getFullYear() > endYear
        }
    }
}
