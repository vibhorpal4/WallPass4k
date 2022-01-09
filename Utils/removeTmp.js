import fs from 'fs'

const removeTmp = (path) => {
    fs.unlink(path, (err) => {
        if (err) throw err;
    })
}

export default removeTmp