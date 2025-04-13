import React from 'react';
import { Pagination as MUIPagination, Box, Typography } from '@mui/material';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  itemsPerPage?: number;
  loading?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  itemsPerPage = 10,
  loading = false
}) => {
  const handleChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    if (value !== currentPage) {
      onPageChange(value);
    }
  };

  // Tính toán phạm vi hiển thị hiện tại
  const startItem = Math.min((currentPage - 1) * itemsPerPage + 1, totalItems);
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  if (totalPages <= 0) return null;

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: { xs: 'column', sm: 'row' }, 
      alignItems: 'center', 
      justifyContent: 'space-between',
      mt: 2, 
      mb: 2,
      opacity: loading ? 0.7 : 1
    }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: { xs: 1, sm: 0 } }}>
        {totalItems > 0 
          ? `Hiển thị ${startItem}-${endItem} của ${totalItems} kết quả` 
          : 'Không có kết quả'}
      </Typography>
      <MUIPagination 
        count={totalPages} 
        page={currentPage}
        onChange={handleChange} 
        color="primary"
        disabled={loading}
        size="medium"
        siblingCount={1}
        boundaryCount={1}
        showFirstButton
        showLastButton
      />
    </Box>
  );
};

export default Pagination; 