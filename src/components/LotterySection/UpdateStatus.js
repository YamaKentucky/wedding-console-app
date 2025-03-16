import React from 'react';

function UpdateStatus({ updateStatus }) {
  if (!updateStatus.pending && updateStatus.success === null) {
    return null;
  }
  
  return (
    <>
      {updateStatus.pending && (
        <div className="update-status pending">
          データベース更新中...
        </div>
      )}
      {updateStatus.success === true && (
        <div className="update-status success">
          データベース更新完了
        </div>
      )}
      {updateStatus.success === false && (
        <div className="update-status error">
          データベース更新失敗
        </div>
      )}
    </>
  );
}

export default UpdateStatus;